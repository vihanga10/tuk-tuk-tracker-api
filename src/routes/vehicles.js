import express from 'express';
import {
  getVehicles, getVehicle, createVehicle,
  updateVehicle, deleteVehicle, getCurrentLocation
} from '../controllers/vehicleController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();
router.use(protect);

/**
 * @swagger
 * /vehicles:
 *   get:
 *     summary: Get all registered tuk-tuks (filter by district, status)
 *     tags: [Vehicles]
 *     parameters:
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of vehicles
 *   post:
 *     summary: Register a new tuk-tuk
 *     tags: [Vehicles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [registrationNumber, driver, deviceId]
 *             properties:
 *               registrationNumber:
 *                 type: string
 *                 example: WP-1234
 *               driver:
 *                 type: string
 *               deviceId:
 *                 type: string
 *                 example: DEV0001
 *               homeDistrict:
 *                 type: string
 *     responses:
 *       201:
 *         description: Vehicle registered
 */
router.route('/')
  .get(getVehicles)
  .post(authorize('hq_admin', 'provincial_admin'), createVehicle);

/**
 * @swagger
 * /vehicles/{id}:
 *   get:
 *     summary: Get a single vehicle by ID
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vehicle data
 *       404:
 *         description: Vehicle not found
 *   put:
 *     summary: Update vehicle details
 *     tags: [Vehicles]
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
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *     responses:
 *       200:
 *         description: Vehicle updated
 *   delete:
 *     summary: Delete a vehicle (hq_admin only)
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vehicle deleted
 */
router.route('/:id')
  .get(getVehicle)
  .put(authorize('hq_admin', 'provincial_admin'), updateVehicle)
  .delete(authorize('hq_admin'), deleteVehicle);

/**
 * @swagger
 * /vehicles/{id}/location/current:
 *   get:
 *     summary: Get current live location of a tuk-tuk
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Current GPS coordinates
 */
router.get('/:id/location/current', getCurrentLocation);

export default router;