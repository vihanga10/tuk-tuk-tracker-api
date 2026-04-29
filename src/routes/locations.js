import express from 'express';
import { submitPing, getLocationHistory, getLiveLocations } from '../controllers/locationController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();

/**
 * @swagger
 * /locations/ping:
 *   post:
 *     summary: Submit GPS location ping (tracking device only)
 *     tags: [Locations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [deviceId, longitude, latitude]
 *             properties:
 *               deviceId:
 *                 type: string
 *                 example: DEV0001
 *               latitude:
 *                 type: number
 *                 example: 6.9271
 *               longitude:
 *                 type: number
 *                 example: 79.8612
 *               speed:
 *                 type: number
 *                 example: 35
 *               heading:
 *                 type: number
 *                 example: 180
 *     responses:
 *       201:
 *         description: Ping recorded
 *       404:
 *         description: Device not registered
 */
router.post('/ping', protect, authorize('device'), submitPing);

/**
 * @swagger
 * /locations/history:
 *   get:
 *     summary: Get historical movement logs (filter by vehicle, time, province, district)
 *     tags: [Locations]
 *     parameters:
 *       - in: query
 *         name: vehicleId
 *         schema:
 *           type: string
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *           example: 2026-04-22T00:00:00Z
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *           example: 2026-04-29T23:59:59Z
 *       - in: query
 *         name: province
 *         schema:
 *           type: string
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *     responses:
 *       200:
 *         description: Location history records
 */
router.get('/history', protect, getLocationHistory);

/**
 * @swagger
 * /locations/live:
 *   get:
 *     summary: Get live last-known location of all active tuk-tuks
 *     tags: [Locations]
 *     parameters:
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *         description: Filter by district ID
 *     responses:
 *       200:
 *         description: Live locations of all active vehicles
 */
router.get('/live', protect, getLiveLocations);

export default router;