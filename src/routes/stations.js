import express from 'express';
import {
  getStations, getStation, createStation,
  updateStation, deleteStation
} from '../controllers/stationController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();
router.use(protect);

/**
 * @swagger
 * /stations:
 *   get:
 *     summary: Get all police stations
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

/**
 * @swagger
 * /stations/{id}:
 *   get:
 *     summary: Get a single police station by ID
 *     tags: [Stations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Station data
 *       404:
 *         description: Station not found
 *   put:
 *     summary: Update a police station (hq_admin or provincial_admin)
 *     tags: [Stations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Station updated
 *   delete:
 *     summary: Delete a police station (hq_admin only)
 *     tags: [Stations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Station deleted
 */
router.route('/:id')
  .get(getStation)
  .put(authorize('hq_admin', 'provincial_admin'), updateStation)
  .delete(authorize('hq_admin'), deleteStation);

export default router;