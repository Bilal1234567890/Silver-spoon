import { Router } from 'express';
import { sendCode, register, login, getMe, forgotPassword, resetPassword } from './authController.js';
import auth from './auth.js';

const router = Router();

router.post('/send-code', sendCode);
router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;