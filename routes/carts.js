import express from 'express';
import {onlyAdmin, isLogged} from '../utils/functions.js';
import * as cartController from '../controller/cartsController.js';

const { Router } = express;
export const carrito = new Router();

carrito.use('/', isLogged);

carrito.get('/', (req, res) => {
    cartController.showCart(res);
})

carrito.get('/:id/productos', (req, res) => {
    cartController.showCartById(req, res);
})

carrito.post('/:id/productosCompra', (req, res) => {
    cartController.buyCartById(req,res);
})

carrito.post('/', (req, res) => {
    onlyAdmin(req, res, cartController.doSaveCart, [req, res]);
})

carrito.post('/:id/productos', (req, res) => {
    onlyAdmin(req, res,cartController.doSaveProductInCart, [req, res]);
})

carrito.put('/:id/productos', (req, res) => {// No se expone a Front.
    onlyAdmin(req, res,cartController.updateCartById, [req, res]);
})

carrito.delete('/:id', (req, res) => {
    onlyAdmin(req, res, cartController.doDeleteCartById, [req, res]);
})

carrito.delete('/:id/productos/:id_prod', (req, res) => {
    onlyAdmin(req, res, cartController.doDeleteProductInCartById, [req, res]);
})