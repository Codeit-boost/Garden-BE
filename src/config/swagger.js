const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Garden API',
      version: '1.0.0',
      description: 'API documentation for Project Garden',
    },
    servers: [
        {
          url: "/", 
          description: "API server",
        },
      ],
    components: {
      securitySchemes: {
        bearerAuth: { // Bearer Token 인증
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routers/*.js'], // 라우트 파일에서 Swagger 주석을 가져옴
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;