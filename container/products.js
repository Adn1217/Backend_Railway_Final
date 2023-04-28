import ContainerFactory from './DAOs/ContainerFactory.class.js';
import { transformToDTO } from './DTOs/products.js';
import { productsCollection } from '../utils/variables.js';
import dotenv from 'dotenv';

dotenv.config({
    path: './.env'
})

const factory = new ContainerFactory();    

function createContainers(){
    const productosFirebase = factory.createContainer('Firebase', productsCollection);
    const productosMongoAtlas = factory.createContainer('MongoAtlas', productsCollection);
    const productosFile = factory.createContainer('File','./local/productos.json');
    return [productosFirebase, productosMongoAtlas, productosFile]
}

export async function getProducts() {
    const [productosFirebase, productosMongoAtlas, productosFile] = createContainers();
    const allProducts = await productosFile.getAll();
    const allProductsMongoAtlas = await productosMongoAtlas.getAll();
    const allProductsFirebase = await productosFirebase.getAll();
    // console.log('Productos recibidos: ', allProductsFirebase)
    const allProductsDTO = transformToDTO(allProductsFirebase);
    // console.log(allProductsDTO);
    return allProductsDTO
}

export async function getProductById(id) {
    const [productosFirebase, productosMongoAtlas, productosFile] = createContainers();
    const product = await productosFile.getById(id);
    const productMongoAtlas = await productosMongoAtlas.getById(id);
    const productFirebase = await productosFirebase.getById(id);
    const productDTO = transformToDTO(productFirebase);
    return productDTO
}

export async function saveProduct(prod) {
    const [productosFirebase, productosMongoAtlas, productosFile] = createContainers();
    const newProductIdMongoAtlas = await productosMongoAtlas.save(prod);
    const newProductIdFirebase = await productosFirebase.save(prod);
    const newProductId = await productosFile.save(prod);
    const newProductDTO = transformToDTO({id:newProductIdFirebase});
    return newProductDTO
}

export async function updateProductByIdFB(updatedProd, id){
    const [productosFirebase, productosMongoAtlas, productosFile] = createContainers();
    const productFirebase = await productosFirebase.updateById(updatedProd, id);
    const productDTO = transformToDTO({id,...productFirebase});
    if (productFirebase){
        return({actualizadoFirebase: productDTO})
    }else{
        return({error: "Producto no encontrado"});
    }
}

export async function updateProductByIdMongo(updatedProd, id){
    const [productosFirebase, productosMongoAtlas, productosFile] = createContainers();
    const productMongoAtlas = await productosMongoAtlas.updateById(updatedProd,id);
    const productDTO = transformToDTO({id, ...productMongoAtlas});
    if (productMongoAtlas){
        return({actualizadoMongo: productDTO})
    }else{
        return({error: "Producto no encontrado"})
    }
}

export async function saveProductByIdFile(updatedProd, id){
    id = parseInt(id);
    const [productosFirebase, productosMongoAtlas, productosFile] = createContainers();
    const allProducts = await productosFile.getAll();
    updatedProd.id = id;
    let updatedProdDTO = transformToDTO(updatedProd);
    let actualizadoArchivo = {actualizadoArchivo: updatedProdDTO};
    let productById = allProducts.find((product) => product.id === id) 
    if (!productById){
        actualizadoArchivo = {error: "Producto no encontrado"};
    }else{
        let newAllProducts = allProducts.map((prod) => {
            if(prod.id === id){
                prod = updatedProd;
                // console.log(prod);
            }
            return prod;
        })
        // console.log('La nueva lista es: ', newAllProducts);
        const allSaved = await productosFile.saveAll(newAllProducts);
        if (allSaved === 'ok'){
            // return({actualizado: updatedProd})
        }else{
            actualizadoArchivo = {error: allSaved};
        }
    }
    return(actualizadoArchivo);
}

export async function deleteProductById(id){
    const [productosFirebase, productosMongoAtlas, productosFile] = createContainers();
    const productFirebase = await productosFirebase.deleteById(id);
    // const productMongoAtlas = await productosMongoAtlas.deleteById(id);
    const product = await productosFile.deleteById(id);
    const productDTO = transformToDTO({id, ...productFirebase});
    return productDTO;
}