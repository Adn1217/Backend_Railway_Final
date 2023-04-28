import * as msgController from './messagesController.js';
import { faker } from '@faker-js/faker';
import logger from '../utils/logger.js';
import * as service from '../service/products.js';

function createRandomProducts(n){
    const randomProducts = [];
    for(let i=0; i<n; i++){
        const randomProduct = {};
        randomProduct.title = faker.commerce.product();
        randomProduct.id = i+1;
        randomProduct.code = `Prd0${Math.round(Math.random()*100)}`;
        // randomProduct.price = (Math.random()*5000).toFixed(2);
        randomProduct.price = faker.commerce.price(100, 5000, 2);
        randomProduct.stock = Math.round((Math.random()*100));
        randomProduct.description = faker.commerce.productDescription();
        randomProduct.thumbnail = faker.image.imageUrl(720, 720, randomProduct.title);
        randomProducts.push(randomProduct);
    }
    return randomProducts;
}

export async function getProducts(req, res) {
    let products = await service.getProducts(req);
    let graphqlQuery = req.query?.query?.search('getProduct') >= 0 || req.originalUrl.search('graphql') > 0 || false;
    console.log('Consulta Graphql?', graphqlQuery);
    if(graphqlQuery){ //GraphQl resuelve promesas.
        return products;
    }else{
        res.send(products);
    }
} 

export function getRandomProducts(res, n) {
    const allProductsRandom = createRandomProducts(n);
    // console.log(allProductsRandom);
    logger.debug(`${JSON.stringify(allProductsRandom)}`);
    res.send(allProductsRandom);
} 

export async function showProducts(req, res) {
    let renderData = await service.showProducts(req);
    res.render('pages/index', renderData);
}

export async function showProductsRandom(res) {
    const allProducts = await getProductsRandom(); 
    const allMessages = await msgController.getMessages();
    // console.log('Los productos son: \n', allProducts);
    // res.send({products: allProducts})
    const user = req.session.user;
    res.render('pages/index', {user: user, products: allProducts, msgs: allMessages});
}

export async function doSaveProduct(req, res) {
    let product = req.body;
    let savedProd = await service.saveProduct(product);
    let graphqlQuery = req.originalUrl.search('graphql') >= 0 || false;
    if(graphqlQuery){ //GraphQl resuelve promesas.
        return savedProd;
    }else{
        res.send(savedProd);
    }
}


export async function updateProductById(req, res) {
    const updatedProd = req.body;
    // console.log(updatedProd);
    const id = req.params.id;
    let updatedFB = await service.updateProductByIdFB(updatedProd, id);
    let updatedMongo = await service.updateProductByIdMongo(updatedProd, id);
    let updatedFile = await service.saveProductByIdFile(updatedProd, id);
    let graphqlQuery = req.originalUrl.search('graphql') >= 0 || false;
    if(graphqlQuery){ //GraphQl resuelve promesas.
        // updatedFB.id = id;
        console.log(updatedFB);
        return updatedFB;
    }else{
        res.send(updatedFB);
    }
}

export async function doDeleteProductById(req, res) {
    const {id} = req.params;
    let deletedProduct = await service.deleteProductById(id);
    let graphqlQuery = req.originalUrl.search('graphql') >= 0 || false;
    if(graphqlQuery){ //GraphQl resuelve promesas.
        console.log(deletedProduct);
        return deletedProduct;
    }else{
        res.send(deletedProduct);
    }
}