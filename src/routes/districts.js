import express from 'express';
import {
  getDistricts, getDistrict, createDistrict,
  updateDistrict, deleteDistrict
} from '../controllers/districtController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();
router.use(protect);

/**
 * @swagger
 * /districts:
 *   get:
 *     summary: Get all 25 districts
 *     tags: [Districts]
 *     parameters:
 *       - in: query
 *         name: province
 *         schema:
 *           type: string
 *         description: Filter by province ID
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
 *     responses:
 *       201:
 *         description: District created
 */
router.route('/').get(getDistricts).post(authorize('hq_admin'), createDistrict);

/**
 * @swagger
 * /districts/{id}:
 *   get:
 *     summary: Get a single district by ID
 *     tags: [Districts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: District data
 *       404:
 *         description: District not found
 *   put:
 *     summary: Update a district (hq_admin only)
 *     tags: [Districts]
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
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: District updated
 *   delete:
 *     summary: Delete a district (hq_admin only)
 *     tags: [Districts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: District deleted
 */
router.route('/:id')
  .get(getDistrict)
  .put(authorize('hq_admin'), updateDistrict)
  .delete(authorize('hq_admin'), deleteDistrict);

export default router;