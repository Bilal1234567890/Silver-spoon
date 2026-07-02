import { Router } from 'express';
import { sendCode, register, login, getMe } from './authController';
import auth from './auth';

const router = Router();

router.post('/send-code', sendCode);
router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);

export default router;