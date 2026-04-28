import express from 'express';
import { getDistricts, createDistrict } from '../controllers/districtController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();
router.use(protect);
router.route('/').get(getDistricts).post(authorize('hq_admin'), createDistrict);

export default router;