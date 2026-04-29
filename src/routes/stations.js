import express from 'express';
import { getStations, createStation } from '../controllers/stationController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();
router.use(protect);

/**
 * @swagger
 * /stations:
 *   get:
 *     summary: Get all police stations (filter by district or province)
 *     tags: [Stations]
 *     parameters:
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *       - in: query
 *         name: province
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of police stations
 *   post:
 *     summary: Create a police station (hq_admin or provincial_admin)
 *     tags: [Stations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code, district, province]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Kandy Central
 *               code:
 *                 type: string
 *                 example: ST001
 *               district:
 *                 type: string
 *               province:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Station created
 */
router.route('/').get(getStations).post(authorize('hq_admin', 'provincial_admin'), createStation);

export default router;