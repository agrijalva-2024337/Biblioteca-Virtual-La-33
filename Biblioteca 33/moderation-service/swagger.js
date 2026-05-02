import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Moderation Service",
      version: "1.0.0",
      description: "Documentación del microservicio de Moderación para el filtrado manual de archivos",
    },
  },
  apis: ["./src/**/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;