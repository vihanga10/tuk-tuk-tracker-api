import express    from 'express';
import dotenv     from 'dotenv';
import cors       from 'cors';
import helmet     from 'helmet';
import morgan     from 'morgan';
import swaggerUi  from 'swagger-ui-express';

import connectDB      from './config/db.js';
import swaggerSpec    from './config/swagger.js';
import errorHandler   from './middleware/errorHandler.js';

import authRoutes     from './routes/auth.js';
import vehicleRoutes  from './routes/vehicles.js';
import locationRoutes from './routes/locations.js';
import provinceRoutes from './routes/provinces.js';
import districtRoutes from './routes/districts.js';
import stationRoutes  from './routes/stations.js';

dotenv.config();
connectDB();

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth',      authRoutes);
app.use('/api/vehicles',  vehicleRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/provinces', provinceRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/stations',  stationRoutes);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (req, res) =>
  res.json({ status: 'OK', timestamp: new Date() })
);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

export default app;