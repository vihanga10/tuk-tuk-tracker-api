import express from 'express';
import { submitPing, getLocationHistory, getLiveLocations } from '../controllers/locationController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();

router.post('/ping',    protect, authorize('device'), submitPing);
router.get('/history', protect, getLocationHistory);
router.get('/live',    protect, getLiveLocations);

export default router;