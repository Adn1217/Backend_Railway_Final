
import logger from './utils/logger.js';
import { sendMail } from './utils/functions.js';
import bCrypt from 'bcrypt';
import { dbFS } from './container/DAOs/ContenedorFirebase.class.js';
import ContainerFactory from './container/DAOs/ContainerFactory.class.js';
import { usersCollection } from './utils/variables.js';
import { usersModel } from './models/users.js';
import mongoose from 'mongoose';

mongoose.set('strictQuery', false);
const factory = new ContainerFactory();    
const usersMongoAtlas = factory.createContainer('MongoAtlas', usersCollection);

function encrypt(pwd){
    let encrypted = bCrypt.hashSync(pwd, bCrypt.genSaltSync(10), null)
    return encrypted
}

export async function saveUserFirebase(newUser){
    let query = dbFS.collection(usersCollection);
    let data = await query.add(newUser);
    return data.id
}

export async function saveUserMongoAtlas(newUser){
    let newElement = new usersModel(newUser);
    let data = await newElement.save();
    return data
}

export async function searchUserFirebase(username){
    let query = dbFS.collection(usersCollection);
    let data = await query.where('username','==', username).get();
    // console.log('Empty: ',data.empty);
    if (data.empty){
        return null ;
    }else{
        let usuario = null;
        data.forEach((doc) => {
            usuario = doc.data();
            // console.log(doc.id + ' => ' + JSON.stringify(doc.data()));
        })
        // console.log('Usuario :', usuario);
        return usuario;
    }
}

export async function searchUserMongoAtlas(username){
    let user = await usersModel.findOne({username: username});
    if(!user){
        return null
    }else{
        return user
    }
}

export async function strategy (username, password, done){
    try{
        // const usuario = usuarios.find( usuario => usuario.username === username);
        const usuario = await searchUserFirebase(username);
        // console.log('usuario FB: ', usuario)
        if(!usuario){
            return done(null, false, {message: 'El usuario no existe'});
        }
        logger.info(`Usuario FB autenticado: ${JSON.stringify(usuario.username)}`);
        if(!bCrypt.compareSync(password, usuario.password)){
            // console.log('Contraseña incorrecta');
            logger.warn(`Contraseña incorrecta para el usuario FB: ${JSON.stringify(usuario.username)}`);
            return done(null, false, {message: 'Contraseña incorrecta'});
        }

        return done(null, usuario);

    }catch(err){

        return done(err);
    }
}

export async function register (req, username, password, done){
    try{

        // const usuario = usuarios.find(usuario => usuario.username === username);
        const usuario = await searchUserFirebase(username);
        const usuarioMongoAtlas = await searchUserMongoAtlas(username);
        
        if(usuario){
            // console.log('Usuario encontrado FB: ', usuario)
            logger.info(`Usuario encontrado FB: ${usuario.username}`);
            // console.log('Usuario encontrado Mongo Atlas: ', usuarioMongoAtlas)
            logger.info(`Usuario encontrado Mongo Atlas: ${usuarioMongoAtlas._id}`);
            return done(null, false, {message: 'El usuario ya está registrado'})
        }

        const newUser = {
            username: username,
            mail: req.body.mail,
            tel: req.body.tel,
            edad: req.body.edad,
            avatar: req.body.avatar,
            password: encrypt(password)
        }

        // usuarios.push(newUser); // Persistencia local.

        let newUserId = await saveUserFirebase(newUser);
        // console.log('Nuevo Usuario FB Id: ', newUserId);
        logger.info(`Nuevo Usuario FB Id:  ${newUserId}`);
        let newUserSaved = await saveUserMongoAtlas(newUser);
        // console.log('Nuevo Usuario Mongo Atlas: ', newUserSaved);
        logger.info(`Nuevo Usuario Mongo Atlas:  ${newUserSaved._id}`);
        sendMail('Se ha registrado un nuevo usuario', newUser);
        done(null, newUser);
    }catch(err){
        done(err);
    }

}
