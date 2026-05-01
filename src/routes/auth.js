import express from 'express';
import {
  register, login, getMe,
  getUsers, updateUser
} from '../controllers/authController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and get JWT token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: hq_admin
 *               password:
 *                 type: string
 *                 example: Admin@123
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authLimiter, login);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user (hq_admin only)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password, role]
 *             properties:
 *               username:
 *                 type: string
 *                 example: station_officer_01
 *               password:
 *                 type: string
 *                 example: Officer@123
 *               role:
 *                 type: string
 *                 enum: [hq_admin, provincial_admin, station_officer, device]
 *               province:
 *                 type: string
 *               district:
 *                 type: string
 *               policeStation:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       403:
 *         description: Not authorized
 */
router.post('/register', protect, authorize('hq_admin'), register);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current logged in user profile
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Current user data
 *       401:
 *         description: Not authorized
 */
router.get('/me', protect, getMe);

/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: Get all users (hq_admin only)
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [hq_admin, provincial_admin, station_officer, device]
 *         description: Filter by role
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of all users
 *       403:
 *         description: Not authorized
 */
router.get('/users', protect, authorize('hq_admin'), getUsers);

/**
 * @swagger
 * /auth/users/{id}:
 *   put:
 *     summary: Update user — activate/deactivate or change role (hq_admin only)
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 example: false
 *               role:
 *                 type: string
 *                 enum: [hq_admin, provincial_admin, station_officer, device]
 *               province:
 *                 type: string
 *               district:
 *                 type: string
 *               policeStation:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
router.put('/users/:id', protect, authorize('hq_admin'), updateUser);

export default router;