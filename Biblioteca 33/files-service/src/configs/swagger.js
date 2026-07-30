import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Files Service",
      version: "1.0.0",
      description: "Microservicio de archivos con Cloudinary, comentarios y subjects"
    },
    servers: [
      {
        url: "http://localhost:3003"
      }
    ],

  },

  apis: ["src/routes/*.js"]
};

export default swaggerJSDoc(options);
