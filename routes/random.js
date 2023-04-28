import express from 'express';
import { fork } from 'child_process';

// import dotenv from 'dotenv';
import parseArgs from 'minimist';
import { randomCount } from '../utils/functions.js';

// import {isLogged} from '../utils/functions.js';

const { Router } = express;
export const random = new Router();
// Con Ngynx activado, esta ruta solo funciona al levantar el servidor en el puerto 8081.

// random.use('/', isLogged);

const options = {
    alias: {
        p: 'port',
        m: 'mode'
    }, 
    default: {
        port: 8080,
        mode: 'fork'
    }
};

const args = parseArgs(process.argv.slice(2), options);

random.get('/?', async (req, res) => {
    let quantity = req.query.cant || 1e8;
    let calculoThread = fork('./randomCalculation.js');
    calculoThread.on('message', (msg) =>{
        if(msg==='Listo'){
            calculoThread.send(quantity);
        }else if(typeof(msg) !== 'object'){
            console.log(msg);
        }else {
            res.send({port: args['port'], conteo:msg});
        }
    })
})

random.get('/sync?', async (req, res) => {
    let quantity = req.query.cant || 1e8;
    let count = randomCount(quantity);
    console.log('El conteo aleatorio es: ', count); //Pedido por el desafío.
    res.send({por: args['port'], conteo: count});
})