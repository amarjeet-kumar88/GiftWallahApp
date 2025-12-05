import swaggerJSDoc from "swagger-jsdoc";
import path from "path";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "E-commerce API",
    version: "1.0.0",
    description:
      "A professional e-commerce backend built with Node.js, TypeScript, Express, and MongoDB."
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local development server"
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  }
};

// project root = process.cwd() (dev me bhi, container me bhi /app)
const rootPath = process.cwd();

export const swaggerOptions: swaggerJSDoc.Options = {
  swaggerDefinition,
  apis: [
    path.join(rootPath, "src/routes/*.ts"),
    path.join(rootPath, "src/routes/**/*.ts"),
    path.join(rootPath, "src/controllers/*.ts")
  ]
};

export const createSwaggerSpec = () => swaggerJSDoc(swaggerOptions);
