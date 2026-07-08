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
  invest, 
  getOrders,
  createDeposit,
  getPendingDeposits,
  approveDeposit,
  rejectDeposit,
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
router.post('/invest', auth, invest);
router.get('/orders', auth, getOrders);
router.post('/deposit', auth, createDeposit);

// Admin routes
router.get('/admin/withdrawals/pending', auth, isAdmin, getPendingWithdrawals);
router.put('/admin/withdrawals/:id/approve', auth, isAdmin, approveWithdrawal);
router.put('/admin/withdrawals/:id/reject', auth, isAdmin, rejectWithdrawal);
router.get('/admin/leaderboard', auth, isAdmin, getLeaderboard); // ✅ new route
router.get('/admin/deposits/pending', auth, isAdmin, getPendingDeposits);
router.put('/admin/deposits/:id/approve', auth, isAdmin, approveDeposit);
router.put('/admin/deposits/:id/reject', auth, isAdmin, rejectDeposit);

export default router;