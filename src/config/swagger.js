import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sri Lanka Police – Tuk-Tuk Tracking API',
      version: '1.0.0',
      description: `
## Sri Lanka Police Real-Time Tuk-Tuk Tracking System

### User Roles
| Role | Description |
|------|-------------|
| **hq_admin** | Full system access — Police Headquarters |
| **provincial_admin** | Province-scoped management |
| **station_officer** | Read-only access, district filtered |
| **device** | GPS device — POST location pings only |

### How To Test
1. Use **POST /auth/login** to get a token
2. Click **Authorize** button (top right 🔒)
3. Enter: \`Bearer YOUR_TOKEN_HERE\`
4. Now all endpoints are unlocked

### Test Credentials
| Role | Username | Password |
|------|----------|---------|
| HQ Admin | hq_admin | Admin@123 |
| Device 1 | dev0001 | Device@0001 |
| Device 2 | dev0002 | Device@0002 |
      `
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Local Development Server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token — get it from POST /auth/login'
        }
      }
    },
    security: [{ BearerAuth: [] }]
  },
  apis: ['./src/routes/*.js']
};

export default swaggerJsdoc(options);