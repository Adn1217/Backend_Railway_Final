import express from 'express';
import {onlyAdmin, isLogged} from '../../utils/functions.js';
import * as prdController from '../../controller/productsController.js';
import {graphqlHTTP} from 'express-graphql';
import {schema} from '../../models/graphql/products.js';

const { Router } = express;
export const productosGraphql = new Router();

productosGraphql.use('/graphql', debug, graphqlHTTP((req, res, next) => ({
    schema: schema,
    rootValue: {
        getProducts: async () => {
            let products = await prdController.getProducts(req, res);
            // next()
            return products;
        },
        getProduct: async ({id}) => {
            req.query.id = id;
            let product = await prdController.getProducts(req, res);
            return product.producto || product.error;
        },
        saveProduct: async({data}) => {
            req.body = data;
            let savedProduct = await prdController.doSaveProduct(req, res);
            // console.log(savedProduct);
            return savedProduct.Guardado || savedProduct.Error;
        },
        updateProduct: async({id, data}) => {
            req.body = data;
            req.params.id = id;
            let savedProduct = await prdController.updateProductById(req, res);
            // console.log(savedProduct);
            return  savedProduct.actualizadoFirebase || savedProduct.error;
        },
        deleteProduct: async ({id}) => {
            req.params.id = id;
            // console.log('id: ', req.query.id);
            let deletedProduct = await prdController.doDeleteProductById(req, res);
            // console.log('Deleted Product: ', deletedProduct);
            return deletedProduct.eliminado;
        }
    },
    graphiql: false
})));

function debug(req, res, next){
    console.log('Query: ', req.query);
    console.log('Body: ', req.body);
    next();
}

function showResponse(req, res){
    res.send(response);
}
