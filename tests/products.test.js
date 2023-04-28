import supertest from 'supertest';
import axios from 'axios';
import {strictEqual, deepStrictEqual} from 'assert';
import {expect} from 'chai';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config({
    path: './.env'
})

const user = process.env.TEST_USER;
const pwd = process.env.TEST_PASSWORD;


axios.defaults = {
    baseURL: `http://localhost`,
    withCredentials: true,
}

const baseUrl = 'http://localhost';
const request = supertest(baseUrl);

await authenticate(user, pwd);
async function authenticate(user, pwd){
    let url = '/login'
    let response = await axios.post(url,{username: user, password: pwd});
    let logStatus = await response.data;
    console.log('Log status: ', logStatus);
    logger.info(`Log status: ${JSON.stringify(logStatus, null, '\t')}`);
}

describe('Batería de pruebas para api "productos"', () => {

    let newProductId;
    const newProd = {
        code: 'Prueba',
        description: 'Prueba con Mocha',
        price: 999,
        stock: 999,
        thumbnail: 'Prueba',
        title: 'Prueba'
    }
    
    const updatedProd = {
        code: 'Prueba',
        description: 'Prueba Mocha Modificada',
        price: 666,
        stock: 666,
        thumbnail: 'Prueba',
        title: 'Prueba Mocha Modificada'
    }

    before(() => {
        console.log('Inicio de Batería de pruebas....');
    })

    after(function authenticate(){
        console.log('Fin de Batería de pruebas.');
    })

    describe('Prueba para endpoint getAll',() => {
        it('Debería retornar status 200', async () => {
            let response = await request.get(`/productos/?`)
            expect(response.status).to.equal(200);
        }).timeout(10000);
    })
    
    describe('Prueba para endpoint save con perfil de usuario', () => {
        it('Debería retornar status 401', async () => {
            const auth = false
            let response = await request.post(`/productos/`).send(newProd).set('auth', auth);
            expect(response.status).to.equal(401);
        }).timeout(10000);
    })
    
    describe('Prueba para endpoint save con perfil de administrador', () => {
        it('Debería retornar status 200', async () => {
            const auth = true;
            let response = await request.post(`/productos/`).send(newProd).set('auth', auth);
            newProductId = response.body.Guardado.id; //Se usará para borrarlo.
            console.log('Id producto guardado: ',newProductId);
            expect(response.status).to.equal(200);
        }).timeout(10000);
    })
    
    describe('Prueba para endpoint getById',() => {
        it('Debería retornar status 200', async () => {
            const id = newProductId;
            // const id = '1yh75hhdJHAe22j3w8G0';
            let response = await request.get(`/productos/${id}`)
            expect(response.status).to.equal(200);
        }).timeout(10000);
    })    
    
    
    describe('Prueba para endpoint updateById con perfil de usuario', () => {
        it('Debería retornar status 401', async () => {
            const auth = false;
            const id = newProductId;
            // const id = 'vkD3f2KffE0ZFCoTUy5w';
            let response = await request.put(`/productos/${id}`).send(updatedProd).set('auth', auth);;
            expect(response.status).to.equal(401);
        }).timeout(10000);
    })

    describe('Prueba para endpoint updateById con perfil de Administrador', () => {
        it('Debería retornar status 200', async () => {
            const auth = true;
            const id = newProductId;
            // const id = 'vkD3f2KffE0ZFCoTUy5w';
            let response = await request.put(`/productos/${id}`).send(updatedProd).set('auth', auth);;
            expect(response.status).to.equal(200);
        }).timeout(10000);
    })

    describe('Prueba para endpoint deleteById con perfil de usuario',() => {
        it('Debería retornar status 401', async () => {
            const auth = false;
            const id = newProductId;
            let response = await request.delete(`/productos/${id}`).set('auth', auth);
            expect(response.status).to.equal(401);
        }).timeout(10000)
    })
    
    describe('Prueba para endpoint deleteById con perfil de Administrador',() => {
        it('Debería retornar status 200', async () => {
            const auth = true;
            const id = newProductId;
            let response = await request.delete(`/productos/${id}`).set('auth', auth);
            expect(response.status).to.equal(200);
        }).timeout(10000)
    })
});

await logout();
async function logout(){
    let url = '/login'
    let response = await axios.delete(url);
    let logStatus = await response.data;
    console.log('Log status: ', logStatus);
    logger.info(`Log status: ${JSON.stringify(logStatus, null, '\t')}`);
}

describe('Fin de baterías de prueba', () => {});