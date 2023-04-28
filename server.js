
import cluster from 'cluster';
import os from 'os';
// import {spawn} from 'child_process';
import express from 'express';
import {Server as HttpServer} from 'http';
import {Server as IOServer} from 'socket.io';
import path from 'path';
import {fileURLToPath} from 'url';
// import {getURL, serviceAccount} from './config.js';
import {getURL, loadMocktoFireBase, logRequest} from './utils/functions.js';

import dotenv from 'dotenv';
import parseArgs from 'minimist';

dotenv.config({
    path: './.env'
})

import * as prdController from './controller/productsController.js';
import * as msgController from './controller/messagesController.js';
import * as prdContainer from './container/products.js';
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics"
// import admin from 'firebase-admin';
// import { doc, getDoc } from "firebase/firestore"

import cookieParser from 'cookie-parser';
import session from 'express-session';

import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import { strategy, register as registerStrategy, saveUserFirebase, saveUserMongoAtlas, searchUserFirebase, searchUserMongoAtlas } from './passport.js'

import {login, register, logout} from './routes/login.js';
import {mensajes} from './routes/messages.js';
import {productos, productosTest} from './routes/products.js';
import {carrito} from './routes/carts.js';
import {random} from './routes/random.js';

import compression from 'compression';
import logger from './utils/logger.js';
import { sessionOpts } from './utils/variables.js';

import swaggerUI from 'swagger-ui-express';
import { swaggerSpecs } from './docs/swaggerSpecs.js';

const numCPUs = os.cpus().length;


const options = {
    alias: {
        p: 'port',
        m: 'mode'
    }, 
    default: {
        port: parseInt(process.env.PORT, 10) || 8080,
        mode: 'fork'
    }
};
const args = parseArgs(process.argv.slice(2), options);


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// const port = parseInt(process.env.PORT, 10) || 8080;
if(isNaN(args['port']) || (typeof(args['port']) !== 'number')){
    args['port'] = 8080;
    // console.warn(`Se ingresa puerto inválido. Se toma puerto ${args['port']} por defecto.`);
    logger.warn(`Se ingresa puerto inválido. Se toma puerto ${args['port']} por defecto.`);
}
const port = args['port'];
// spawn('export', [`PORT=${port}`]);
process.env['PORT'] = port;

const mode = args['mode'];

if(mode !== 'cluster' && mode !=='fork'){
    // console.warn('Modo inválido, se ejecutará en el modo fork por defecto.');
    logger.warn('Modo inválido, se ejecutará en el modo fork por defecto.');
}

const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);


// export let dbFS;

app.use(express.urlencoded({extended: true}))
app.use(express.json());

// const usuarios = []; // Persistencia local.


passport.use('register', new LocalStrategy({
    passReqToCallback: true
}, (req, user, password, done) => registerStrategy(req, user, password, done)));

passport.use('login', new LocalStrategy((username, password, done) => strategy(username, password, done)))

passport.serializeUser((user, done) => {
    done(null, user.username);
})

passport.deserializeUser(async (username, done) => {
    // console.log('Usuarios: '+ JSON.stringify(usuarios) + ' Usuario autenticado: '+ username);
    // const usuario = usuarios.find(usuario => usuario.username === username); //Persistencia local
    const usuario = await searchUserFirebase(username);
    done(null, usuario);
})


app.use(cookieParser());
app.use(session(sessionOpts))

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');
// app.set('views', "./views"); //Por defecto.
app.use('/static', express.static(path.join(__dirname, 'public')))
// app.use(express.static(__dirname + '/public'));
// console.log(__dirname + '/public');

app.use('/', logRequest);
app.use('/api/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpecs));
app.post('/login',
    passport.authenticate('login', {
    failureRedirect: '/faillogin', 
    successRedirect: '/successlogin'
    })
)
app.use('/login', login, (req, res) =>{
    logger.warn(`Petición ${req.method} a ruta inexistente ${req.originalUrl}`)
    res.sendStatus(400);
});
app.post('/register',
    passport.authenticate('register', {
    failureRedirect: '/failregister', 
    successRedirect: '/successregister'
    })
)
app.use('/register', register);
app.use('/logout', logout);
app.use('/productos', productos, (req, res) =>{
    // console.log('Respuesta: ', res.json())
    logger.warn(`Petición ${req.method} a ruta inexistente ${req.originalUrl}`)
    res.sendStatus(400); // Bad Request
});
app.use('/productos-test', productosTest);
app.use('/carrito', carrito);
app.use('/mensajes', mensajes);
app.use('/randoms', compression(), random);

// loadMocktoFireBase(['products', 'carts']); // Habilitar solo al requerirse recargar mocks originales.

io.on('connection', (socket) => {
    // console.log('Usuario Conectado');
    logger.info('Usuario conectado');
    socket.emit('welcome', 'Usuario conectado');
    // mongoAtlasConnect('ecommerce');

    socket.on('productRequest', async () => {
        const allProducts = await prdContainer.getProducts();
        io.sockets.emit('productos', {productos: allProducts});
    })
    
    socket.on('messageRequest', async () => {
        let allMsgs = await msgController.getMsgs();
        io.sockets.emit('mensajes', {msgs: allMsgs});
    })

    socket.on('normMessageRequest', async () => {
        let allMsgs = await msgController.getNormMessages();
        // console.log('Mensajes Normalizados: ', JSON.stringify(allMsgs));
        io.sockets.emit('mensajes', {msgs: allMsgs});
    })
})

app.get('/', (req, res) => {
    res.redirect('/login');
})

app.get('/home', compression(), (req, res) => {
    if(req.isAuthenticated()){
        // console.log('SesiónIniciada: ', req.session);
        logger.info(`SesiónIniciada: ${JSON.stringify(req.session)}`);
        prdController.showProducts(req, res);
    }else{
        res.status(401).send({Error: 'Usuario no autenticado'}) // Unauthorized.
    }
})

app.get('/info', compression(), (req, res) =>{
    const usedArgs = {
        inputArgs : args,
        OS: process.env.OS,
        numCPUs: numCPUs,
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage().rss,
        execPath: process.execPath,
        processID: process.pid,
        filePath: process.env.PWD
    }
    // console.log("ProcessInfo: ",usedArgs);
    logger.info(`ProcessInfo: ${JSON.stringify(usedArgs)}`);
    res.render('pages/info.ejs', {Args: usedArgs});
})

app.get('/faillogin', (req, res) =>{
    res.status(401).send({status: 'Autenticación incorrecta'});
})

app.get('/faillog', (req, res) =>{
    res.render('pages/login', {error: 'Autenticación incorrecta'});
})

app.get('/successlogin', (req, res) =>{
    res.status(200).send({status: 'Ok'});
})

app.get('/failregister', (req, res) => {
    res.status(400).send({status:'El usuario ya existe'});
})

app.get('/failreg', (req, res) => {
    res.render('pages/register', {error: 'El usuario ya existe'});
})

app.get('/successregister', async (req, res) => {
    res.status(200).send({status: 'Ok'});
})

app.use('*', (req, res) =>{
    logger.warn(`Petición ${req.method} a ruta inexistente ${req.originalUrl}`)
    res.sendStatus(404) //Not Found
});

if(cluster.isPrimary && mode === 'cluster'){
    // console.log('CPUs: ', numCPUs );
    logger.silly(`CPUs: ${numCPUs}`);
    console.log(`Servidor maestro ${process.pid} escuchando en el puerto ${port}`)
    logger.debug(`Servidor maestro ${process.pid} escuchando en el puerto ${port}`)
    for(let i=0; i<numCPUs; i++){
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        // console.log(`Hijo ${worker.process.pid} finalizado.`)
        logger.debug(`Hijo ${worker.process.pid} finalizado.`)
    })

}else{
    let serverType='';
    // mongoAtlasConnect(mongoAtlasDb, userName, pwd);
    // firebaseConnect();
    // dbFS = admin.firestore();
    const server = httpServer.listen(port, () => {
        if(mode === 'cluster'){
            serverType = ' hijo';
        }
        console.log(`Servidor${serverType} ${process.pid} escuchando en el puerto ${port}`);
        logger.debug(`Servidor${serverType} ${process.pid} escuchando en el puerto ${port}`);
    })
    server.on('error', (error) => {
        // console.log('Se presentó error: ', error.message)
        logger.error(`Se presentó error: ${error.message}`)
    }) 
    console.log('\n################INICIO DE SERVIDOR################\n')
    logger.silly('################INICIO DE SERVIDOR################')
}
