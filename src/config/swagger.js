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
## Sri Lanka Police Real-Time Tuk-Tuk Tracking System

A centralized RESTful API for real-time GPS tracking and movement logging 
of registered three-wheelers across Sri Lanka.

### User Roles & Access Control
| Role | Description | Access |
|------|-------------|--------|
| **hq_admin** | Police Headquarters | Full system access |
| **provincial_admin** | Provincial offices | Province-scoped management |
| **station_officer** | Police stations | Read-only, district-scoped |
| **device** | GPS tracking device | POST location pings only |

### How To Authenticate
1. Call **POST /auth/login** with credentials below
2. Copy the **token** from the response
3. Click the **🔒 Authorize** button at top right
4. Enter: \`Bearer <your_token>\`

### Test Credentials
| Role | Username | Password |
|------|----------|---------|
| HQ Admin | \`hq_admin\` | \`Admin@123\` |
| Provincial Admin | \`provincial_admin_wp\` | \`Provincial@123\` |
| Station Officer | \`station_officer_01\` | \`Officer@123\` |
| Device | \`dev0001\` | \`Device@0001\` |

### Key Features
- Real-time GPS location tracking
- 7-day historical movement logs
- Province & district-wise filtering
- Role-based access control (RBAC)
- ETag / Conditional GET support
- Rate limiting & request ID tracking
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