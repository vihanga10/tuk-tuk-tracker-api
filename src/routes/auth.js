import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();

router.post('/login',    login);
router.post('/register', protect, authorize('hq_admin'), register);
router.get('/me',        protect, getMe);

export default router;