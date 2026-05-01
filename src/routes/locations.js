import express from 'express';
import { submitPing, getLocationHistory, getLiveLocations } from '../controllers/locationController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import { pingLimiter } from '../middleware/rateLimiter.js';

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
router.post('/ping', protect, authorize('device'), pingLimiter, submitPing);

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
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [timestamp, speed]
 *           default: timestamp
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort direction
 *     responses:
 *       200:
 *         description: Location history records
 *         headers:
 *           X-Total-Count:
 *             description: Total number of matching records
 *             schema:
 *               type: integer
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
 *       - in: query
 *         name: province
 *         schema:
 *           type: string
 *         description: Filter by province ID
 *     responses:
 *       200:
 *         description: Live locations of all active vehicles
 *         headers:
 *           X-Total-Count:
 *             description: Total number of active vehicles
 *             schema:
 *               type: integer
 *           Cache-Control:
 *             description: no-store — always fresh data
 *             schema:
 *               type: string
 */
router.get('/live', protect, getLiveLocations);

export default router;