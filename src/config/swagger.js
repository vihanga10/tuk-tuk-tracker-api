import swaggerJsdoc from 'swagger-jsdoc';

const servers = [
  {
    url: 'http://localhost:3000/api',
    description: 'Local Development Server'
  }
];

// Add production server if deployed URL is set
if (process.env.DEPLOYED_URL) {
  servers.unshift({
    url: `${process.env.DEPLOYED_URL}/api`,
    description: 'Production Server (Render)'
  });
}

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sri Lanka Police – Tuk-Tuk Tracking API',
      version: '1.0.0',
      description: `
## 
A centralized RESTful API for real-time GPS tracking and movement logging 
of registered three-wheelers across Sri Lanka.

### User Roles & Access Control
| Role | Description | 
|------|-------------|
| **hq_admin** | Police Headquarters | 
| **provincial_admin** | Provincial offices | 
| **station_officer** | Police stations | 
| **device** | GPS tracking device | 


### Test Credentials
|Role |Username |Password |
|------|----------|---------|
|HQ Admin |hq_admin | Admin@123 |
|Provincial Admin (Western) |provincial_admin_wp |Provincial@123 |
|Provincial Admin (Central) |provincial_admin_cp |Provincial@123 |
|Station Officer 01 |station_officer_01 |Officer@123 |
|Station Officer 02 |station_officer_02 |Officer@123 |
|Device |dev0001 |Device@0001 |



      `
    },
    servers,
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token from POST /auth/login'
        }
      }
    },
    security: [{ BearerAuth: [] }]
  },
  apis: ['./src/routes/*.js']
};

export default swaggerJsdoc(options);