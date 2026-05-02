import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "IA OCR Service",
      version: "1.0.0",
      description: "Microservicio de procesamiento de archivos con IA"
    },
    servers: [
      {
        url: "http://localhost:3001/IA-OCR-Service/v1"
      }
    ]
  },
  apis: ["./src/**/*.js"]
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;