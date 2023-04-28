import {buildSchema} from 'graphql';

export const schema = buildSchema(`
    type Product {
        id: ID!,
        code: String,
        description: String,
        price: Float,
        stock: Int,
        thumbnail: String,
        timestamp: String,
        title: String
    }    
    input ProductInput {
        code: String,
        description: String,
        price: Float,
        stock: Int,
        thumbnail: String,
        title: String
    }    
    type Query {
        getProduct(id: ID!): Product,
        getProducts:[Product]
    }
    type Mutation {
        saveProduct(data: ProductInput): Product,
        updateProduct(id: ID!, data: ProductInput): Product,
        deleteProduct(id: ID!): Product
    }
`)