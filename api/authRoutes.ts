import { Router } from 'express';
import { sendCode, register, login, getMe } from './authController.js';
import auth from './auth.js';

const router = Router();

router.post('/send-code', sendCode);
router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);

export default router;