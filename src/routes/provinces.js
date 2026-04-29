import express from 'express';
import { getProvinces, createProvince, deleteProvince } from '../controllers/provinceController.js';
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
 *         description: List of provinces
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
router.route('/').get(getProvinces).post(authorize('hq_admin'), createProvince);

/**
 * @swagger
 * /provinces/{id}:
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
router.delete('/:id', authorize('hq_admin'), deleteProvince);

export default router;