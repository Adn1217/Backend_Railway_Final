
export default class ProductoDTO {
    constructor(producto){
        if(producto){
            this.id = producto.id,
            this.code = producto.code,
            this.title = producto.title,
            this.description = producto.description,
            this.price = producto.price,
            this.stock = producto.stock,
            this.thumbnail = producto.thumbnail
        }
    }
}

export function transformToDTO(productos) {
    if(Array.isArray(productos)){
        let productosDTO = productos.map((producto) => new ProductoDTO(producto));
        return productosDTO
    }else{
        let productoDTO = new ProductoDTO(productos);
        return productoDTO
    }
}