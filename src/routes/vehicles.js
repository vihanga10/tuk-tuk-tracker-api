import express from 'express';
import { body } from 'express-validator';
import {
  getVehicles, getVehicle, createVehicle,
  updateVehicle, deleteVehicle, getCurrentLocation
} from '../controllers/vehicleController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';

const router = express.Router();
router.use(protect);

const vehicleValidation = [
  body('registrationNumber').notEmpty().withMessage('Registration number is required'),
  body('driver').notEmpty().withMessage('Driver ID is required'),
  body('deviceId').notEmpty().withMessage('Device ID is required'),
  validate
];

/**
 * @swagger
 * /vehicles:
 *   get:
 *     summary: Get all registered tuk-tuks
 *     tags: [Vehicles]
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended]
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [createdAt, registrationNumber, status]
 *           default: createdAt
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
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
 *         headers:
 *           X-Total-Count:
 *             description: Total number of vehicles matching filter
 *             schema:
 *               type: integer
 *           ETag:
 *             description: Entity tag for conditional GET
 *             schema:
 *               type: string
 *       304:
 *         description: Not Modified (ETag matched)
 *   post:
 *     summary: Register a new tuk-tuk (hq_admin or provincial_admin)
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
 *                 example: 64f1a2b3c4d5e6f7a8b9c0d1
 *               deviceId:
 *                 type: string
 *                 example: DEV0001
 *               homeDistrict:
 *                 type: string
 *     responses:
 *       201:
 *         description: Vehicle registered
 *       400:
 *         description: Validation error
 */
router.route('/')
  .get(getVehicles)
  .post(authorize('hq_admin', 'provincial_admin'), vehicleValidation, createVehicle);

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
 *               homeDistrict:
 *                 type: string
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
 *     summary: Get real-time current location of a tuk-tuk
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Current GPS coordinates and last ping time
 *         headers:
 *           Cache-Control:
 *             description: no-store — always fresh
 *             schema:
 *               type: string
 *       404:
 *         description: Vehicle not found
 */
router.get('/:id/location/current', getCurrentLocation);

export default router;