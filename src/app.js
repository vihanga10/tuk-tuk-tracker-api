import express    from 'express';
import dotenv     from 'dotenv';
import cors       from 'cors';
import helmet     from 'helmet';
import morgan     from 'morgan';
import swaggerUi  from 'swagger-ui-express';

import connectDB        from './config/db.js';
import swaggerSpec      from './config/swagger.js';
import errorHandler     from './middleware/errorHandler.js';
import requestId        from './middleware/requestId.js';
import { globalLimiter } from './middleware/rateLimiter.js';

import authRoutes     from './routes/auth.js';
import vehicleRoutes  from './routes/vehicles.js';
import locationRoutes from './routes/locations.js';
import provinceRoutes from './routes/provinces.js';
import districtRoutes from './routes/districts.js';
import stationRoutes  from './routes/stations.js';
import driverRoutes   from './routes/drivers.js';

dotenv.config();
connectDB();

const app = express();

// Security headers
app.use(helmet());
app.use(cors({
  origin: '*',
  exposedHeaders: ['X-Total-Count', 'X-Request-Id', 'ETag', 'Cache-Control']
}));

// Logging & parsing
app.use(morgan('dev'));
app.use(express.json());

// Request ID tracking
app.use(requestId);

// Global rate limiter
app.use('/api/', globalLimiter);

// API Routes
app.use('/api/auth',      authRoutes);
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
    status: 'OK',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  })
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`));

export default app;