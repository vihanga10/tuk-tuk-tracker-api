import express from 'express';
import { body } from 'express-validator';
import {
  getDrivers, getDriver, createDriver,
  updateDriver, deleteDriver
} from '../controllers/driverController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';

const router = express.Router();
router.use(protect);

const driverValidation = [
  body('fullName').notEmpty().withMessage('Full name is required').trim(),
  body('nic').notEmpty().withMessage('NIC is required').trim(),
  body('licenseNumber').notEmpty().withMessage('License number is required').trim(),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  validate
];

/**
 * @swagger
 * /drivers:
 *   get:
 *     summary: Get all drivers (with sorting, filtering, pagination)
 *     tags: [Drivers]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [fullName, createdAt, nic]
 *           default: fullName
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
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
 *         description: List of drivers
 *         headers:
 *           X-Total-Count:
 *             description: Total number of drivers
 *             schema:
 *               type: integer
 *           ETag:
 *             description: Entity tag for conditional GET
 *             schema:
 *               type: string
 *   post:
 *     summary: Register a new driver (hq_admin or provincial_admin)
 *     tags: [Drivers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, nic, licenseNumber]
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Kamal Perera
 *               nic:
 *                 type: string
 *                 example: 900123456V
 *               licenseNumber:
 *                 type: string
 *                 example: LIC123456
 *               phone:
 *                 type: string
 *                 example: "0771234567"
 *               address:
 *                 type: string
 *                 example: "123 Galle Road, Colombo"
 *     responses:
 *       201:
 *         description: Driver registered
 *       400:
 *         description: Validation error
 */
router.route('/')
  .get(getDrivers)
  .post(authorize('hq_admin', 'provincial_admin'), driverValidation, createDriver);

/**
 * @swagger
 * /drivers/{id}:
 *   get:
 *     summary: Get a single driver by ID
 *     tags: [Drivers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Driver data
 *       404:
 *         description: Driver not found
 *   put:
 *     summary: Update driver details
 *     tags: [Drivers]
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
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Driver updated
 *   delete:
 *     summary: Delete a driver (hq_admin only)
 *     tags: [Drivers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Driver removed
 */
router.route('/:id')
  .get(getDriver)
  .put(authorize('hq_admin', 'provincial_admin'), updateDriver)
  .delete(authorize('hq_admin'), deleteDriver);

export default router;