import swaggerJSDocs from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API en Express con Swagger",
            description: "Servicios asociados al proyecto"
        }
    },
    apis: ['./docs/**/*.yaml']
}

export const swaggerSpecs = swaggerJSDocs(options);
