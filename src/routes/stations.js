import express from 'express';
import { getStations, createStation } from '../controllers/stationController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();
router.use(protect);
router.route('/').get(getStations).post(authorize('hq_admin', 'provincial_admin'), createStation);

export default router;