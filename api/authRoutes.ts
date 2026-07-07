import { Router } from 'express';
import {
  sendCode,
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  verifyReferral,
  updateBankDetails,
  requestWithdrawal,
  getHistory,
  getPendingWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  getLeaderboard,
  dailyCheck, // ✅ added
} from './authController.js';
import auth from './auth.js';
import { isAdmin } from './isAdmin.js';

const router = Router();

router.post('/send-code', sendCode);
router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-referral', auth, verifyReferral);
router.post('/update-bank', auth, updateBankDetails);
router.post('/withdraw', auth, requestWithdrawal);
router.post('/daily-check', auth, dailyCheck);
router.get('/history', auth, getHistory);

// Admin routes
router.get('/admin/withdrawals/pending', auth, isAdmin, getPendingWithdrawals);
router.put('/admin/withdrawals/:id/approve', auth, isAdmin, approveWithdrawal);
router.put('/admin/withdrawals/:id/reject', auth, isAdmin, rejectWithdrawal);
router.get('/admin/leaderboard', auth, isAdmin, getLeaderboard); // ✅ new route

export default router;