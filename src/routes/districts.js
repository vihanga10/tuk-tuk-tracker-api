import express from 'express';
import { getDistricts, createDistrict } from '../controllers/districtController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();
router.use(protect);

/**
 * @swagger
 * /districts:
 *   get:
 *     summary: Get all 25 districts (filter by province)
 *     tags: [Districts]
 *     parameters:
 *       - in: query
 *         name: province
 *         schema:
 *           type: string
 *         description: Province ID to filter districts
 *     responses:
 *       200:
 *         description: List of districts
 *   post:
 *     summary: Create a district (hq_admin only)
 *     tags: [Districts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code, province]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Kandy
 *               code:
 *                 type: string
 *                 example: KAN
 *               province:
 *                 type: string
 *                 example: 64f1a2b3c4d5e6f7a8b9c0d1
 *     responses:
 *       201:
 *         description: District created
 */
router.route('/').get(getDistricts).post(authorize('hq_admin'), createDistrict);

export default router;