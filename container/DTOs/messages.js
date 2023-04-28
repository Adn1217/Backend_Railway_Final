
export default class MensajeDTO {
    constructor(mensaje, type = 'message'){
        if (type === 'message'){
            this.fecha = mensaje.fecha,
            this.mensaje = mensaje.mensaje,
            this.usuario = mensaje.usuario
        }else if (type === 'normMsg'){
            mensaje = mensaje[0];
            this.author = {
                alias : mensaje.author.alias,
                apellido : mensaje.author.apellido,
                avatar : mensaje.author.avatar,
                edad : mensaje.author.edad,
                id : mensaje.author.id,
                nombre : mensaje.author.nombre
            },
            this.fecha = mensaje.fecha,
            this.mensaje = mensaje.mensaje,
            this.usuario = mensaje.usuario
        }else if (type === 'normMsgList'){
            this.id = mensaje.id 
            mensaje = mensaje.msj[0];
            this.author = {
                alias : mensaje.author.alias,
                apellido : mensaje.author.apellido,
                avatar : mensaje.author.avatar,
                edad : mensaje.author.edad,
                id : mensaje.author.id,
                nombre : mensaje.author.nombre
            },
            this.fecha = mensaje.fecha,
            this.mensaje = mensaje.mensaje
        }
    }
}

export function transformToDTO(mensajes, type) {
    // console.log('Tipo: ',type);
    if(Array.isArray(mensajes)){
        let mensajesDTO = mensajes.map((mensaje) => new MensajeDTO(mensaje, type));
        return mensajesDTO
    }else{
        let mensajeDTO = new MensajeDTO(mensajes, type);
        return mensajeDTO
    }
}