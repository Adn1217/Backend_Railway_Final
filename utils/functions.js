import fs from 'fs'
import { dbFS } from '../container/DAOs/ContenedorFirebase.class.js';
import logger from './logger.js';

import twilio from 'twilio';
import {createTransport} from 'nodemailer';

import { twilioAccountSID, twilioMsgSID, twilioAuthToken, twilioWappNumber, personalWappNumber, personalMail, gmailMail, gmailAppPass } from './variables.js';

const client = twilio(twilioAccountSID, twilioAuthToken);

export function getURL(db, userName, pwd) {
    const URL = `mongodb+srv://${userName}:${pwd}@backendcluster.mlmtmq6.mongodb.net/${db}?retryWrites=true&w=majority`;
    return URL
}

export function calculateId(elemento, data){
    let id = 0;
    let idMax = id;
    data.forEach((elemento) => {
        elemento.id > idMax && (idMax = elemento.id);
    });
    id = idMax + 1;
    elemento.id = id;
    // console.log('ElementoWithId', elemento)
    return elemento
}

export async function loadMocktoFireBase(colecciones){

    for (let i = 0; i < colecciones.length;i++){
        if (colecciones[i] === 'products'){
            const stockData = './mocks/mockProductos.json';
            const productsTestCollection = dbFS.collection(colecciones[i]);
            await loadMockData(stockData, productsTestCollection);
        }else if (colecciones[i] ==='carts'){
            const stockData = './mocks/mockCart.json';
            const cartsTestCollection = dbFS.collection(colecciones[i]);
            await loadMockData(stockData, cartsTestCollection);
        }
    }
}

async function loadMockData(stockData, coleccion){
    let data = JSON.parse(fs.readFileSync(stockData));
    let resp = [];
    let ids = [];
    let success = true;
    let msg = '';
    console.log(`Cargando datos de ${JSON.stringify(coleccion._queryOptions.collectionId)} a Firebase...`)

    await Promise.all(data.map(async (doc) =>{
        try {
            resp = await coleccion.add(doc);
            ids.push(resp.id)
        }catch(error){
            success = false;
            console.log("Se ha presentado el siguiente error durante el proceso de carga", error);
        }finally{
            msg ="La carga ha " + (success ? "sido exitosa" : "fallado");
            console.log(msg);
        }
    }));
    (success) && (console.log('Fueron cargados productos con los siguientes ids: '+ids.join(', ')));
}

export async function onlyAdmin(req, res, next, params) {
    const isAdmin = req.headers.auth; //Solo para poder probarlo desde el Front.
    // console.log(String(isAdmin).toLowerCase() == "true");
    console.log('Es administrador? ',isAdmin);
    if (String(isAdmin).toLowerCase() == "true") { 
        next(...params);
    } else { 
        res.status(401).json({error:-1,descripcion:`Ruta ${req.originalUrl} metodo ${req.method} no autorizado`});
    }
}

export function isLogged(req, res, next){
    console.log(req.session);
    if (req.isAuthenticated()){
        next()
    }else{
        res.send({error: 'Usuario no autenticado'});
    }
}

export function logRequest(req, res, next){
    logger.info(`Petición ${req.method} a ruta ${req.url}`)
    next()
}

export function randomCount(cant=0){
    let conteo = {};
    for (let i=0; i<cant; i++){
        // console.log(i);
        let randNumber = Math.floor(Math.random()*cant);
        if (Object.keys(conteo).includes(randNumber.toString())){
            conteo[randNumber] += 1;
        }else{
            conteo[randNumber] = 1;
        }
    }
    return conteo;
}

export async function sendWappMsg(msg, data, asunto){
    let htmlItems = '';
    let topic = asunto ? 'compra:' : 'usuario:';
    for(let key in data){
        if(typeof(data[key]) === 'object'){
            data[key] = JSON.stringify(data[key]);
        }
        htmlItems += `*${key}*: ${data[key]}\n`
    }
    let htmlList = `${htmlItems}`
    try{
        const message = await client.messages.create({
            body: `${msg} \n ${htmlList}`,
            from: `whatsapp:${twilioWappNumber}`,
            to: `whatsapp:${personalWappNumber}`
        })
        logger.info(`Se ha enviado mensaje de wapp: ${JSON.stringify(message.body)}`);
        return message;
    }catch(error){
        logger.error(`Se ha presentado el siguiente error al intentar enviar mensaje de Wapp: `, error);
        return error;
    }
}

export async function sendSmsMsg(msg, tel){
    try{
        const message = await client.messages.create({
            body: `${msg}`,
            messagingServiceSid: `${twilioMsgSID}`,
            to: `${tel}` || `${personalWappNumber}`
        })
        logger.info(`Se ha enviado mensaje de texto: ${JSON.stringify(message.body)}`);
        return message;
    }catch(error){
        logger.error(`Se ha presentado el siguiente error al intentar enviar mensaje de texto: `, error);
        return error;
    }
}

export async function sendMail(msg, data, asunto){
    
    const transporter = createTransport({
        service: 'gmail',
        port: 587,
        auth: {
            user: `${gmailMail}`,
            pass: `${gmailAppPass}`
        }
    })
    let htmlItems = '';
    let topic = asunto ? 'compra' : 'usuario';
    for(let key in data){
        if(typeof(data[key]) === 'object'){
            data[key] = JSON.stringify(data[key]);
        }
        htmlItems += `<li><strong>${key}</strong>: ${data[key]}</li>`
    }
    let htmlList = `<ul>${htmlItems}</ul>`
    const mailOptions = {
        from: 'Ecommerce Backend',
        to: `${personalMail}`,
        subject: asunto || `Nuevo registro`,
        text: `${msg} \n Datos de ${topic}: \n ${JSON.stringify(data)}`,
        html: `<h3>${msg}</h3>
               <div>
                    <p>Datos de ${topic}:</p>
               </div>
               <div>
                    ${htmlList}
               </div>`
                    
    }
    try{
        const info = await transporter.sendMail(mailOptions)
        logger.info(`Se ha enviado correo: ${JSON.stringify(info)}`);
    }catch(error){
        logger.error(`Se ha presentado el siguiente error al intentar enviar correo: `, error);
        return error;
    }
}

