import {buildSchema} from 'graphql';

export const schema = buildSchema(`
    type Message {
        id: ID!,
        fecha: String,
        mensaje: String,
        usuario: String
    }    
    input MessageInput {
        fecha: String,
        mensaje: String,
        usuario: String
    }    
    type Query {
        getMessages:[Message]
    }
    type Mutation {
        saveMessage(data: MessageInput): Message
    }
`)