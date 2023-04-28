import * as fs from "fs";
import {calculateId} from '../../utils/functions.js';
import dotenv from 'dotenv';
import dbClient from "./dbClient.class.js";
import logger from '../../utils/logger.js';

dotenv.config({
    path: './.env'
})


let instance = {};
export default class ContenedorArchivo extends dbClient {
  constructor(ubicacion) {
    super();
    this.ruta = ubicacion;
  }

  static getInstance(ruta){
    let key = ruta.substring(2);
    if(!instance[key]){ // SINGLETON
      instance[key] = new ContenedorArchivo(ruta);
      console.log(`Se crea instancia tipo File para ${ruta}.`);
      // console.log('Instancias: ', instance);
      return instance[key]
    }else{
      // console.log(`Ya existe instancia tipo File para ${ruta}.`);
      return instance[key];
    }
  }
  
  async connect(){
    try{
        await fs.promises.readFile(this.ruta, "utf-8");
        logger.info(`Servidor ${process.pid} se ha conectado exitosamente al archivo ${ubicacion}`)
    }catch(error){
        logger.error(`Se ha presentado error al intentar conectar el servidor ${process.pid} archivo ${ubicacion}: ${error}`)
    }
  }

  async disconnect(){
    try{
        logger.info(`Servidor ${process.pid} se ha desconectado exitosamente del archivo ${ubicacion}`)
    }catch(error){
        logger.error(`Se ha presentado error al intentar desconectar el servidor ${process.pid} del archivo ${ubicacion}: ${error}`)
    }
  }

  async save(elemento) {
    try {
      let data = await fs.promises.readFile(this.ruta, "utf-8");
      let elementoWithId;
      data !== [] && (data = JSON.parse(data))
      if (!data || data.length === 0) {
        console.log("No hay datos.");
      }
      elementoWithId = calculateId(elemento, data);
      elementoWithId.timestamp = new Date().toLocaleString("en-GB");
      if (elementoWithId.length > 1){
        await fs.promises.writeFile(this.ruta,JSON.stringify([...elementoWithId], null, 2));
      }else{
        await fs.promises.writeFile(this.ruta,JSON.stringify([...data, elementoWithId], null, 2));
      }
      console.log('GuardadoFile: ', elementoWithId)
      return elementoWithId;
    } catch (error) {
      console.log("Se ha presentado error ", error);
    } 
  }

  async saveAll(productos) {
    try {
      await fs.promises.writeFile(this.ruta,JSON.stringify(productos, null, 2));
      return {actualizadoArchivo: 'Ok'};
    } catch (error) {
      console.log("Se ha presentado error ", error);
      return {error: error};
    }
  }

  async getById(Id) {
    Id = parseInt(Id);
    try {
      let data = await fs.promises.readFile(this.ruta);
      let id = Id;
      data = await JSON.parse(data);
      let prod = data.find((producto) => producto.id === id);
      if (prod?.id) {
        console.log("El producto es: ", prod);
        return prod;
      } else {
        return null;
      }
    } catch (error) {
      console.log("Se ha presentado error ", error);
    }
  }

  async getAll() {
    try {
      let data = await fs.promises.readFile(this.ruta, "utf-8");
      data = await JSON.parse(data);
      return data;
    } catch (error) {
      console.log("Se ha presentado error ", error);
    }
  }

  async deleteById(Id) {
    let Id_int = parseInt(Id);
    try {
      let data = await fs.promises.readFile(this.ruta, "utf-8");
      let id = Id_int;
      data = await JSON.parse(data);
      let prod = data.find((producto) => producto.id === id);
      if (prod?.id) {
        data = data.filter((producto) => producto.id !== id);
        await fs.promises.writeFile(
          this.ruta,
          JSON.stringify(data, null, 2)
        );
        console.log(`\nSe elimina el producto con id=${id} (deleteById(${id})): \n`, prod);
        // console.log("Quedan los productos: ", data);
      } else {
        console.log("En File no existe el producto con id: ", Id);
      }
      return prod;
    } catch (error) {
      console.log("Se ha presentado error ", error);
    }
  }
  
  async deleteProductInCartById(Id_prod, Id_cart = undefined) {
    try {
      let data = await fs.promises.readFile(this.ruta, "utf-8");
      let id_prod = parseInt(Id_prod);
      let id_cart = parseInt(Id_cart);
      let originalData = JSON.parse(data);
      data = JSON.parse(data);
      (id_cart) && (data = data.find((cart) => cart.id === id_cart));
      (data?.id) ?? (console.log("No existe el carrito con id: ", id_cart));
      if(data?.id === undefined && Id_cart){
        return false
      }
      console.log(data);
      let prod = (id_cart) ? data.productos.find((producto) => producto.id === id_prod) : data.find((producto) => producto.id === id_prod);
      if (prod?.id) {
        data = (id_cart) ? data.productos.filter((producto) => producto.id !== id_prod) : data.filter((producto) => producto.id !== id_prod);
        (id_cart) ?? await fs.promises.writeFile(this.ruta,JSON.stringify(data, null, 2));
        if (id_cart){
          console.log(originalData.find((cart) => cart.id === id_cart).productos)
          originalData.find((cart) => cart.id === id_cart).productos = data;
          await fs.promises.writeFile(this.ruta,JSON.stringify(originalData, null, 2));
          console.log(`\nSe elimina el producto con id=${id_prod} del carrrito con id=${id_cart}: \n`, prod);
        }
        id_cart ?? console.log(`\nSe elimina el producto con id=${id_prod}): \n`, prod);
        // console.log("Quedan los productos: ", data);
      } else {
        console.log("No existe el producto con id: ", id_prod);
      }
      return prod;
    } catch (error) {
      console.log("Se ha presentado error ", error);
    }
  }
  
  async deleteAll() {
    try {
      let data = await fs.promises.readFile(this.ruta, "utf-8");
      if (!data) {
        console.log("No hay productos");
      } else {
        await fs.promises.writeFile(this.ruta, "[]");
        console.log("Se han borrado los productos ", data);
      }
    } catch (error) {
      console.log("Se ha presentado error ", error);
    }
  }
}