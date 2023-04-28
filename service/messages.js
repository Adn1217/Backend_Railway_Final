import * as container from '../container/messages.js';

export async function getMessages(){
    let allMessages = container.getMessages();
    return allMessages;
}

export async function saveMessage(msg){
    if (Object.keys(msg).length === 0){
        return({Error: "Mensage no recibido"})
    }else{
        // console.log('Mensaje: ', msg);
        let newMsg = container.saveMessage(msg);
        return newMsg;
    }
}

export async function getNormMessages(){
    let allNormMessages = container.getNormMessages();
    return allNormMessages;
}

export async function saveNormalizedMessage(msg){
    if (Object.keys(msg).length === 0){
        return({Error: "Mensage no recibido"})
    }else{
        // console.log('Mensaje: ', msg);
        const newMsg = await container.saveNormalizedMessage(msg);
        return newMsg; 
    }
}