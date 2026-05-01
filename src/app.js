import express    from 'express';
import dotenv     from 'dotenv';
import cors       from 'cors';
import helmet     from 'helmet';
import morgan     from 'morgan';
import swaggerUi  from 'swagger-ui-express';

import connectDB          from './config/db.js';
import swaggerSpec        from './config/swagger.js';
import errorHandler       from './middleware/errorHandler.js';
import requestId          from './middleware/requestId.js';
import { globalLimiter, authLimiter } from './middleware/rateLimiter.js';

import authRoutes     from './routes/auth.js';
import vehicleRoutes  from './routes/vehicles.js';
import locationRoutes from './routes/locations.js';
import provinceRoutes from './routes/provinces.js';
import districtRoutes from './routes/districts.js';
import stationRoutes  from './routes/stations.js';
import driverRoutes   from './routes/drivers.js';

dotenv.config();

// Environment Validation
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET', 'JWT_EXPIRES_IN'];
const missingEnv   = REQUIRED_ENV.filter(key => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

// Database
connectDB();

// App Setup
const app = express();

// Security headers
app.use(helmet());
app.use(cors({
  origin: '*',
  exposedHeaders: ['X-Total-Count', 'X-Request-Id', 'ETag', 'Cache-Control']
}));

// Logging & parsing
app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));

// Request ID tracking
app.use(requestId);

// Global rate limiter
app.use('/api/', globalLimiter);

// Routes
app.use('/api/auth',      authLimiter, authRoutes);
app.use('/api/vehicles',  vehicleRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/provinces', provinceRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/stations',  stationRoutes);
app.use('/api/drivers',   driverRoutes);

// Swagger docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) =>
  res.json({
    status:      'OK',
    timestamp:   new Date(),
    uptime:      `${Math.floor(process.uptime())}s`,
    environment: process.env.NODE_ENV,
    version:     '1.0.0'
  })
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler 
app.use(errorHandler);

// Server
const PORT   = process.env.PORT || 3000;
const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT} [${process.env.NODE_ENV}]`)
);

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received — shutting down gracefully');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received — shutting down gracefully');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

export default app;