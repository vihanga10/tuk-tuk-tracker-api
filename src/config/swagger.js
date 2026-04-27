import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sri Lanka Police – Tuk-Tuk Tracking API',
      version: '1.0.0',
      description: 'Real-time GPS tracking and movement logging system for registered three-wheelers'
    },
    servers: [{ url: '/api' }],
    components: {
      securitySchemes: {
        BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    },
    security: [{ BearerAuth: [] }]
  },
  apis: ['./src/routes/*.js']
};

export default swaggerJsdoc(options);