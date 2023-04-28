import * as service from '../service/messages.js';

export async function getMsgs(){
    const allMessages = await service.getMessages();
    // console.log('Los mensajes son: \n', allMessages);
    return allMessages;
}

export async function showMsgs(res) {
    const allMessages = await service.getMessages();
    // console.log('Los mensajes son: \n', allMessages);
    res.render('pages/index', {msgs: allMessages})
}

export async function doSaveMessage(req, res) {
    const msg = req.body;
    const newMsg = await service.saveMessage(msg); 
    let graphqlQuery = req.originalUrl.search('graphql') >= 0;
    if(graphqlQuery){ // Graphql resuelve promesas;
        return ({Guardado: newMsg})
    }else{
        res.send({Guardado: newMsg})
    }
}

export async function doSaveNormMessage(req, res) {
    const msg = req.body;
    const newMsg = await service.saveNormalizedMessage(msg); 
    res.send({Guardado: newMsg})
}

export async function getNormMessages(req, res) {
    const allNormMessages = await service.getNormMessages();
    return allNormMessages;
}