import { transformToDTO  as transformToDTOProds } from "./products.js";


export default class CarritoDTO {
    constructor(carrito){
        if(carrito){
            this.id = carrito.id,
            this.timestamp = carrito.timestamp,
            this.usuario = carrito.usuario,
            this.productos = transformToDTOProds(carrito.productos)
        }else if (carrito === false){
            this.carritoEncontrado = false;
        }
    }
}

export function transformToDTO(carritos) {
    if(Array.isArray(carritos)){
        let carritosDTO = carritos.map((carrito) => new CarritoDTO(carrito));
        return carritosDTO
    }else{
        let carritoDTO = new CarritoDTO(carritos);
        return carritoDTO
    }
}