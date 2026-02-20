import { Router } from 'express';
import { register, login, googleLogin, getProfile, updateProfile, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/profile', authenticateToken, getProfile);
router.post('/profile', authenticateToken, updateProfile);

export default router;
