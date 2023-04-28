import express from 'express';
import {isLogged} from '../utils/functions.js';
import * as msgController from '../controller/messagesController.js';
import {messagesGraphql} from './graphql/messages.js';

const { Router } = express;
export const mensajes = new Router();

mensajes.use('/', isLogged);

mensajes.get('/', async (req, res) => {
    let allMessages = await msgController.getMsgs(); // Anteriormente era showMsgs(res)
    res.send({msgs: allMessages})
})

mensajes.post('/', (req, res) => {
    msgController.doSaveMessage(req, res);
})

mensajes.post('/normalized', (req, res) => {
    msgController.doSaveNormMessage(req, res);
})

mensajes.post('/graphql', messagesGraphql);
mensajes.use('/graphql', messagesGraphql);