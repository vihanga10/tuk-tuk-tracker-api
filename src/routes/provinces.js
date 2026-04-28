import express from 'express';
import { getProvinces, createProvince, deleteProvince } from '../controllers/provinceController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();
router.use(protect);
router.route('/').get(getProvinces).post(authorize('hq_admin'), createProvince);
router.delete('/:id', authorize('hq_admin'), deleteProvince);

export default router;