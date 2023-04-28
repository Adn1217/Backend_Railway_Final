import * as container from '../container/carts.js';
import { sendMail, sendSmsMsg, sendWappMsg } from '../utils/functions.js';
import logger from '../utils/logger.js';

export async function getCarts(){
    const carts = await container.getCarts(); 
    return carts;
}

export async function saveCart(cart){
    if (Object.keys(cart).length === 0){
        return({Error: "Carrito no recibido"})
    }else{
        let newCart = await container.saveCart(cart);
        // console.log('Carrito: ', JSON.stringify(cart));
        return ({Guardado: newCart});
    }
}

export async function doSaveProductInCartFB(newProd, id_cart){
    let savedProd = await container.saveProductInCartFB(newProd, id_cart);
    if(savedProd.error){
        logger.error(`Carrito ${id_cart} no encontrado en Firebase.`);
    }else{
        // console.log("Se ha agregado en Firebase el producto: \n", newProdWithId);
        logger.debug(`Se ha agregado en Firebase el producto: ${savedProd}`);
    }
    return(savedProd)
}

export async function doSaveProductInCartMongo(newProd, id_cart){
    let savedProd = await container.saveProductInCartMongo(newProd, id_cart);
    if (savedProd.actualizadoMongo){
        // console.log("Se ha agregado en Mongo el producto al carrito: \n", cart);
        logger.info(`Carrito actualizado en Mongo: ${JSON.stringify(savedProd.actualizadoMongo)}`);
        // res.send({actualizadoMongo: cartMongoAtlas})
    }else{
        // console.log("Carrito no encontrado en Mongo.");
        logger.error(`Carrito ${id_cart} no encontrado en Mongo.`);
        // res.send({error: "Carrito no encontrado"})
    }
    return savedProd;
}

export async function doSaveProductInCartFile(res, newProd, id_cart){
    let savedProd = await container.saveProductInCartByIdFile(res, newProd, parseInt(id_cart));
    if(savedProd.error){
        logger.debug(`Se ha presentado error al intentar guardar en Archivo: ${JSON.stringify(savedProd.error)}`)
    }else{
        logger.debug(`Actualizado en Archivo: ${JSON.stringify(savedProd.actualizadoArchivo)}`)
    }
    return savedProd;
}

export async function getCartById(id){
    // console.log(cartById);
    // logger.debug(`El carrito es: ${JSON.stringify(cartById)}`)
    let cartById = await container.getCartById(id);
    if (!cartById || Object.keys(cartById).length === 0 ){
        return({error:"Carrito no encontrado"});
    }else{
        // console.log(cartById.productos);
        logger.debug(`Los productos del carrito son: ${JSON.stringify(cartById.productos)}`)
        return({productosCarrito: cartById.productos});
    }
}

export async function deleteCartById(id){
    let deletedCart = await container.deleteCartById(id);
    if (!deletedCart || deletedCart?.deletedCount == 0 || Object.keys(deletedCart).length === 0){
        deletedCart = {
            error: "Carrito no encontrado"
        }
        return(deletedCart)
    }else{
        return({eliminado: deletedCart})
    }
    // return deletedCart;
}

export async function deleteProductInCartById(id_prod, id_cart){
    let deletedProduct = await container.deleteProductInCartById(id_prod, id_cart);
    // console.log("Producto eliminado: ", deletedProduct);
    logger.info(`Producto eliminado: ${JSON.stringify(deletedProduct)}`);
    if (deletedProduct.carritoEncontrado === false){
        deletedProduct = {
            error: `Carrito ${id_cart} no encontrado`
        }
        return(deletedProduct)
    }else{
        if (Object.keys(deletedProduct).length === 0){
            deletedProduct = {
                error: `Producto ${id_prod} no encontrado en el carrito ${id_cart}`
            }
            return(deletedProduct)
        }else{
            return({eliminado: deletedProduct})
        }
    }
    // return deletedProduct;
}

export async function updateCartByIdFB(updatedProd, id){
    const updatedProductFB = await container.updateCartByIdFB(updatedProd, id);
    if(!('error' in updatedProductFB)){
        // console.log("Se ha actualizado el producto: \n", updatedProductFB);
        logger.info(`Se ha actualizado en FB el producto: ${JSON.stringify(updatedProductFB.actualizadoFirebase)}`);
    }else{
        // console.log("Producto no actualizado");
        logger.warn('Producto no actualizado');
        logger.error(`Producto ${id} no encontrado`);
    }
    return updatedProductFB;
}

export async function updateCartByIdFile(updatedCart, id){
    let cartById = await container.getCartById(id);
    if (!cartById){
        logger.error(`Carrito ${id} no encontrado`);
        res.send({error: "Carrito no encontrado"});
    }else{
        const allCarts = await container.getCarts();
        const newCarts = allCarts.map((cart) => {
            if(cart.id === id){
                cart = {...cart, ...updatedCart};
                cart.id = id;
                // console.log(cart);
            }
            return cart;
        })
        // console.log('La nueva lista de carritos es: ', newCarts);
        logger.debug(`La nueva lista de carritos es: ${JSON.stringify(newCarts)}`);
        const allSaved = await container.saveAllCarts(newCarts);
        if (allSaved.actualizadoArchivo === 'Ok'){
            return({actualizado: updatedCart})
        }else{
            logger.error(`Se ha presentado error al guardar de forma local: ${JSON.stringify(allSaved)}`)
            return({error: allSaved})
        }
    }
    
}

export async function buyCartById(id, user){
    let response = [];
    let cart = await getCartById(id);
    response.push(cart);
    if(!("error" in cart)){
        response.push({compraRegistrada: 'Ok'});
        sendMail('Se ha registrado una nueva compra', cart, `Nuevo pedido de ${user?.username} - ${user?.mail}`);
        sendWappMsg('Se ha registrado una nueva compra', cart, `Nuevo pedido de ${user?.username} - ${user?.mail}`);
        sendSmsMsg('Su pedido ha sido recibido y se encuentra en proceso', user?.tel)
    }else{
        response.push({compraRegistrada: 'Error'});
    }
    return response;
}