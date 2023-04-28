import express from 'express';
import {onlyAdmin, isLogged} from '../../utils/functions.js';
import * as msgController from '../../controller/messagesController.js';
import {graphqlHTTP} from 'express-graphql';
import {schema} from '../../models/graphql/messages.js';

const { Router } = express;
export const messagesGraphql = new Router();

// productosGraphql.use('/', isLogged);
messagesGraphql.use('/', debug, graphqlHTTP((req, res) => ({
    schema: schema,
    rootValue: {
        getMessages: async () => {
            let messages = await msgController.getMsgs()
            return messages;
        },
        saveMessage: async({data}) => {
            req.body = data;
            let savedMessage = await msgController.doSaveMessage(req, res);
            console.log(savedMessage);
            return savedMessage.Guardado;
        }
    },
    graphiql: false
})));

function debug(req, res, next){
    console.log('Query: ', req.query);
    console.log('Body: ', req.body);
    next();
}
