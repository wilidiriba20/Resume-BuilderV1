
import swaggerAutogen from "swagger-autogen";

const generateSwagger = swaggerAutogen({
  openapi: "3.0.0",
  autoBody: true,
  autoQuery: true,
  autoHeaders: true,
});

const doc = {
  info: {
    title: "Resume Builder API",
    version: "1.0.0",
    description: "API documentation for the Resume Builder application.",
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local development server",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

const outputFile = "./docs/swagger-output.json";

const endpointsFiles = ["./src/server.js"];

generateSwagger(outputFile, endpointsFiles, doc);
