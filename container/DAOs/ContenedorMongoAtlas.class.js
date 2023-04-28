import { BSONType, ObjectId } from "mongodb";
import {productsModel} from '../../models/products.js';
import {msgsModel} from '../../models/messages.js';
import {cartsModel} from '../../models/carts.js';
import {usersModel} from '../../models/users.js';
import { productsCollection, messagesCollection, cartsCollection } from "../../utils/variables.js";
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dbClient from "./dbClient.class.js";
import {getURL} from '../../utils/functions.js';
import logger from '../../utils/logger.js';

dotenv.config({
    path: './.env'
})

mongoose.set('strictQuery', false);

let instance = {};
const userName = process.env.DB_MONGO_USER;
const pwd = process.env.DB_MONGO_PWD;
const mongoAtlasDb = process.env.DB_MONGOATLAS;
const advancedOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}
export default class ContenedorMongoAtlas extends dbClient {
  constructor(collection) {
    super();
    this.collection = collection;
  }

  static getInstance(collection){
    if(!instance[collection]){ // SINGLETON
      instance[collection] = new ContenedorMongoAtlas(collection);
      instance[collection].connect(mongoAtlasDb, userName, pwd);
      console.log(`Se crea instancia tipo MongoAtlas para ${collection}.`);
      // console.log('Instancias: ', instance);
      return instance[collection]
    }else{
      // console.log(`Ya existe instancia tipo MongoAtlas para ${collection}.`);
      return instance[collection];
    }
  }

  async connect(db, userName, pwd) {
      try{
          const URL = getURL(db, userName, pwd);
          await mongoose.connect(URL, advancedOptions)
          logger.info(`Servidor ${process.pid} se ha conectado exitosamente a MongoAtlas`);
      }catch(error){
          logger.error(`Se ha presentado el siguiente error al intentar conectar el servidor ${process.pid} a mongoatlas: ${error}`);
      }
  }

  async disconnect(){
    try{
        instance[this.collection].disconnect();
        // mongoose.disconnect();
        logger.info(`El servidor ${process.pid} se ha desconectado exitosamente de MongoAtlas.`)
    }catch(error){
        logger.error(`Se ha presentado el siguiente error al intentar desconectar de mongoatlas: ${error}`);
    }
  }

  async save(elemento) {
    try {
      let newElement;
      if (this.collection === productsCollection){
        newElement = new productsModel(elemento);
      }else if (this.collection === messagesCollection){
        newElement = new msgsModel(elemento);
      }else if (this.collection === cartsCollection){
        newElement = new cartsModel(elemento);
      }else{
        newElement = new usersModel(elemento);
      }
      let data = await newElement.save();
      console.log('GuardadoMongo: ', data);
      return data;
    } catch (error) {
      console.log("Se ha presentado error ", error);
    } finally {
      // instance[this.collection]?.disconnect();
    }
  }

  async getById(Id) {
    if (mongoose.Types.ObjectId.isValid(Id)){
      try {
        let element;
        if (this.collection === productsCollection){
          element = await productsModel.find({_id: ObjectId(Id)});
        }else{
          element = await cartsModel.find({_id: ObjectId(Id)});
        }
        console.log(element);
        if (element[0]?._id) {
          // console.log("El elemento  es: ", element);
          return element[0];
        } else {
          return null;
        }
      } catch (error) {
          console.log("Se ha presentado error ", error);
      } finally {
        // instance[this.collection]?.disconnect();
      }
    }else{
      console.log("El id no cumple la estructura de Mongo");
      return null;
    }
  }

  async getAll() {
    try {
      let data;
      if (this.collection === productsCollection){
        data = await productsModel.find();
      }else if (this.collection === messagesCollection){
        data = await msgsModel.find();
      }else{
        data = await cartsModel.find();
      }
      return data;
    } catch (error) {
      console.log("Se ha presentado error ", error);
    } finally {
      // instance[this.collection]?.disconnect();
    }
  }

  async deleteById(Id) {
    if (mongoose.Types.ObjectId.isValid(Id)){
      let element; 
      try {
        if (this.collection === productsCollection){
          element = await productsModel.deleteOne({_id: ObjectId(Id)});
        }else{
          element = await cartsModel.deleteOne({_id: ObjectId(Id)});
        }
        console.log(element);
        if (element[0]?.acknowledged) {
          console.log(`\nSe elimina el elemento con _id=${Id} (deleteById(${Id})): \n`, element);
          // console.log("Quedan los productos: ", data);
        } else {
          console.log("No se ha podido eliminar el elemento ", Id);
        }
        return element;
      } catch (error) {
        console.log("Se ha presentado error ", error);
      } finally {
        // instance[this.collection]?.disconnect();
      }
    }else{
      console.log("El id no cumple la estructura de Mongo.");
      return null;
    }
  }
  
  async updateById(elemento, id) {
    if (mongoose.Types.ObjectId.isValid(id)){
      try {
        let element;
        if (this.collection === productsCollection){
          element = await productsModel.findByIdAndUpdate(ObjectId(id), elemento );
        }else{
          element = await cartsModel.findByIdAndUpdate(ObjectId(id), elemento );
        }
        return element;
      } catch (error) {
        console.log("Se ha presentado error ", error);
      } finally {
        // instance[this.collection]?.disconnect();
      }
    }else{
      console.log("El id no cumple la estructura de Mongo");
      return null;
    }
  }
  
  async deleteProductInCartById(Id_prod, Id_cart = undefined) {
    if (mongoose.Types.ObjectId.isValid(Id_prod) && mongoose.Types.ObjectId.isValid(Id_cart)){
      try {
        let id_prod = Id_prod;
        let id_cart = Id_cart;
        let cart = await cartsModel.find({_id: ObjectId(id_cart)});
        cart = cart[0];
        console.log('Carrito encontrado: ',  cart);
        if(cart?._id === undefined) {
            console.log("En Mongo no existe el carrito con id: ", id_cart);
            return false;
        }else{
          let cartProd = await cartsModel.find({'productos._id': ObjectId(id_prod)})
          console.log('Producto encontrado en Mongo:',cartProd);
          if (cartProd && cartProd.length === 1){
            cartProd = cartProd[0];
            let index  = cartProd.productos.findIndex( (prod) => prod._id === ObjectId(id_prod));
            let deletedProd = cartProd.productos.splice(index,1)
            await cartProd.save();
            console.log(`Se elimina en Mongo el producto con id = ${id_prod} del carrito con id = ${id_cart}`);
            return deletedProd;
          }else{
            console.log(`No existe en Mongo el producto con id= ${id_prod} en el carrito con id=${id_cart}`);
            return undefined;
          }
        }
      } catch (error) {
        console.log("Se ha presentado error ", error);
      } finally {
        // instance[this.collection]?.disconnect();
      }
    }else{
      mongoose.Types.ObjectId.isValid(Id_prod) && console.log("El id_prod no cumple la estructura de Mongo");
      mongoose.Types.ObjectId.isValid(Id_cart) && console.log("El id_cart no cumple la estructura de Mongo");
      return undefined;
    }
  }
  
  async deleteAll() {
    let response; 
    try {
      if (this.collection === productsCollection){
        response = await productsModel.deleteMany({});
      }else{
        response = await cartsModel.deleteMany({});
      }
      console.log(element);
      if (response[0]?.acknowledged) {
        console.log(`\nSe eliminan todos los elementos de la colección ${this.collection}\n`);
        // console.log("Quedan los productos: ", data);
      } else {
        console.log(`No se ha podido eliminar la colección ${this.collection} `);
      }
      return response;
    } catch (error) {
      console.log(`Se ha presentado error al intentar borrar todos los documentos de la colección ${this.collection}: \n`, error);
    } finally {
      // instance[this.collection]?.disconnect();
    }
  }
  
}