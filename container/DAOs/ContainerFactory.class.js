
import ContenedorArchivo from './ContenedorArchivo.class.js';
import ContenedorMongoAtlas from './ContenedorMongoAtlas.class.js';
import {ContenedorFirebase} from './ContenedorFirebase.class.js';

export default class ContainerFactory {

  createContainer(db, type) {
    try {
      let container;
      if (db === 'Firebase'){
        container = ContenedorFirebase.getInstance(type);
      }else if (db === 'MongoAtlas'){
        container = ContenedorMongoAtlas.getInstance(type)
      }else if (db === 'File'){
        container = ContenedorArchivo.getInstance(type)
      }
      return container;
    } catch (error) {
      console.log(`Se ha presentado error al intentar crear instancia tipo ${db} para ${type} \n`, error);
    }
  }
}