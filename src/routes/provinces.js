import express from 'express';
import {
  getProvinces, getProvince, createProvince,
  updateProvince, deleteProvince
} from '../controllers/provinceController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();
router.use(protect);

/**
 * @swagger
 * /provinces:
 *   get:
 *     summary: Get all 9 provinces
 *     tags: [Provinces]
 *     responses:
 *       200:
 *         description: List of all provinces
 *   post:
 *     summary: Create a province (hq_admin only)
 *     tags: [Provinces]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Western
 *               code:
 *                 type: string
 *                 example: WP
 *     responses:
 *       201:
 *         description: Province created
 */
router.route('/')
  .get(getProvinces)
  .post(authorize('hq_admin'), createProvince);

/**
 * @swagger
 * /provinces/{id}:
 *   get:
 *     summary: Get a single province by ID
 *     tags: [Provinces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Province data
 *       404:
 *         description: Province not found
 *   put:
 *     summary: Update a province (hq_admin only)
 *     tags: [Provinces]
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
 *                 example: Western Province
 *               code:
 *                 type: string
 *                 example: WP
 *     responses:
 *       200:
 *         description: Province updated
 *   delete:
 *     summary: Delete a province (hq_admin only)
 *     tags: [Provinces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Province deleted
 */
router.route('/:id')
  .get(getProvince)
  .put(authorize('hq_admin'), updateProvince)
  .delete(authorize('hq_admin'), deleteProvince);

export default router;