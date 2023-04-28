import logger from '../utils/logger.js';
import * as service from '../service/carts.js';


export async function showCart(res) {
    const cart = await service.getCarts(); 
    // console.log('El carrito es: \n', cart);
    logger.debug(`El carrito es: ${cart}`)
    res.send({carrito: cart})
    // res.render('pages/index', {products: allProducts, msgs: allMessages})
}

export async function showCartById(req, res) {
    const id = req.params.id;
    // console.log(id);
    let cartById = await service.getCartById(id);
    res.send(cartById);
}

export async function doDeleteCartById(req, res) {
    const {id} = req.params;
    let deletedCart = await service.deleteCartById(id);
    res.send(deletedCart);
}

export async function doDeleteProductInCartById(req, res) {
    const {id, id_prod} = req.params;
    const id_cart = id;
    let deletedProduct = await service.deleteProductInCartById(id_prod, id_cart);
    res.send(deletedProduct);
}

export async function doSaveCart(req, res) {
    const cart = req.body;
    const newCart = await service.saveCart(cart);
    res.send(newCart);
}


export async function doSaveProductInCart(req, res) {
    const newProd = req.body;
    const {id} = req.params;
    const id_cart = id;
    let savedProductFB = await service.doSaveProductInCartFB(newProd, id_cart);
    let savedProductMongo = await service.doSaveProductInCartMongo(newProd, id_cart);
    let savedProductFile = await service.doSaveProductInCartFile(newProd, id_cart);
    res.send(savedProductFB);
}

 // Sin FRONT.
export async function updateCartById(req, res) {
    const updatedCart = req.body;
    const id = req.params.id;
    let updated = await service.updateCartByIdFB(updatedCart, id);
    res.send(updated);
}

export async function buyCartById(req,res){
    const id = req.params.id;
    const user = req.user;
    const response = await service.buyCartById(id, user);
    console.log(response);
    // res.status(200).send({compraRegistrada: 'Ok'});
    res.status(200).send(response)
}