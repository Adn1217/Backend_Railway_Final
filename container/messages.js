
import ContainerFactory from './DAOs/ContainerFactory.class.js';
import { transformToDTO } from './DTOs/messages.js';
import {schema, normalize, denormalize} from 'normalizr';
import { messagesCollection, normMessagesCollection } from '../utils/variables.js';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config({
    path: './.env'
})

const factory = new ContainerFactory();    

function createContainers(){
    const messagesFirebase = factory.createContainer('Firebase', messagesCollection);
    const messagesFirebaseNorm = factory.createContainer('Firebase', normMessagesCollection);
    const messagesMongoAtlas = factory.createContainer('MongoAtlas', messagesCollection);
    const messagesFile = factory.createContainer('File','./local/mensajes.json');
    return [messagesFirebase, messagesFirebaseNorm, messagesMongoAtlas, messagesFile]
}

export async function getMessages() {
    const [messagesFirebase, messagesFirebaseNorm, messagesMongoAtlas, messagesFile] = createContainers();
    const allMessages = await messagesFile.getAll();
    let allMessagesMongoAtlas = await messagesMongoAtlas.getAll();
    (allMessagesMongoAtlas[0]?.fecha) ?? (allMessagesMongoAtlas = allMessagesMongoAtlas.map( (msg) => ({...msg._doc, fecha: new Date(msg._id.getTimestamp()).toLocaleString('en-GB')})))
    const allMessagesFirebase = await messagesFirebase.getAll();
    console.log(allMessagesFirebase);
    const allMessagesDTO = transformToDTO(allMessagesFirebase, 'message');
    console.log(allMessagesDTO)
    return allMessagesDTO;
} 

export async function saveMessage(msg) {
    const [messagesFirebase, messagesFirebaseNorm, messagesMongoAtlas, messagesFile] = createContainers();
    const newMessageFirebase = await messagesFirebase.save(msg);
    const newMessageMongoAtlas = await messagesMongoAtlas.save(msg);
    const newMessage = await messagesFile.save(msg);
    // console.log('Saved message FB: ', newMessageFirebase);
    const newMessageDTO = transformToDTO(msg, 'message');
    console.log('Saved message DTO: ', msg);
    newMessageDTO.id = newMessageFirebase;
    return newMessageDTO;
} 

function denormalizeMessage(msg){
    const normalizedMessage = msg;
    const authorSchema = new schema.Entity('authorSchema',{},{idAttribute: 'id'});
    const messageSchema = new schema.Entity('messageSchema',{
        author: authorSchema
    }, {idAttribute: 'author'})
    const msgsSchema = new schema.Entity('msgsSchema',{
        messages: [messageSchema]
    }, {idAttribute: 'type'} );
    const denormalizedMessage = denormalize(normalizedMessage.result, msgsSchema, 
    normalizedMessage.entities);
    return denormalizedMessage;
}

export async function saveNormalizedMessage(msg){
    const [messagesFirebase, messagesFirebaseNorm, messagesMongoAtlas, messagesFile] = createContainers();
    const denormMsgFirebase = denormalizeMessage(msg);
    const newMessageFirebase = await messagesFirebaseNorm.save(denormMsgFirebase);
    // console.log('Saved norm message: ', denormMsgFirebase);
    const newMessageDTO = transformToDTO(denormMsgFirebase, 'normMsg');
    console.log('Saved norm message DTO: ', newMessageDTO);
    return newMessageDTO;
}

function normalizeMessage(msg){
    const authorSchema = new schema.Entity('authorSchema');
    const msjSchema = new schema.Entity('msjSchema',{
        author: authorSchema
    }, {idAttribute: 'id'})
    const msgSchema = new schema.Entity('msgSchema',{
        messages: [msjSchema]
    })
    const messageSchema = new schema.Entity('messageSchema',{
        msj: msgSchema
    }, {idAttribute: 'id'})
    const msgsSchema = new schema.Entity('msgsSchema',{
        messages: [messageSchema]
    }, {idAttribute: 'type'} );

    const normalizedMessage = normalize(msg, msgsSchema);
    return normalizedMessage;
}


export async function getNormMessages() {
    const [messagesFirebase, messagesFirebaseNorm, messagesMongoAtlas, messagesFile] = createContainers();
    const allMessagesFirebase = await messagesFirebaseNorm.getAll();
    logger.debug(`Mensajes desde Firebase: ${JSON.stringify(allMessagesFirebase)}`);
    let newAllMessages  = [];
    let cont = 0;
    allMessagesFirebase.forEach((msg) => {
        let message = {};
        message.id = cont;
        message.msj = msg;
        newAllMessages.push(message);
        cont +=1;
    })
    newAllMessages = {type: 'msgList', messages: newAllMessages};
    // console.log('Mensajes desde Firebase restructurados', JSON.stringify(newAllMessages));
    // console.log('Messages to Norm : ', JSON.stringify(newAllMessages));
    // const newAllMessagesDTO = transformToDTO(newAllMessages, 'normMsgList');
    // console.log('Mensajes DTOs: ', newAllMessagesDTO);
    const allNormMessagesFirebase = normalizeMessage(newAllMessages);
    return allNormMessagesFirebase;
} 