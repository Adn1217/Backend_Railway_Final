
export default class dbClient {

    //Métodos obligatorios, deben implementarse en las subclases.

    async connect() {
            throw new Error ('Falta implementar método connect en la subclase')
        }

    async disconnect(){
            throw new Error ('Falta implementar método disconnect en la subclase')
    }
}