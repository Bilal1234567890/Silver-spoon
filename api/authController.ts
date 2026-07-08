import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { sequelize } from './db.js';
import User from './User.js';
import VerificationCode from './VerificationCode.js';
import generateCode from './generateCode.js';
import sendVerificationEmail from './sendEmail.js';
import Admin from './Admin.js';
import Withdrawal from './Withdrawal.js';
import Deposit from './Deposit.js';
import Order from './Order.js';

export const sendCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, phone } = req.body;

    if (!email || !phone) {
      return res.status(400).json({ message: 'Email and phone are required' });
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await VerificationCode.destroy({ where: { email } });
    await VerificationCode.create({ email, code, expiresAt });

    try {
      await sendVerificationEmail(email, code);
      res.status(200).json({ message: 'Verification code sent to your email' });
    } catch (emailError: any) {
      console.error('📧 Email error:', emailError);
      res.status(500).json({
        message: 'Failed to send verification email.',
        error: emailError.message,
      });
    }
  } catch (err: any) {
    console.error('❌ sendCode error:', err);
    res.status(500).json({
      message: 'Server error while sending code',
      error: err.message,
    });
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, phone, password, code } = req.body;

    const record = await VerificationCode.findOne({ where: { email, code } });
    if (!record) {
      return res.status(400).json({ message: 'Invalid or missing verification code' });
    }
    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Verification code expired' });
    }

    // Generate unique username
    let username = '';
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;
    while (!isUnique && attempts < maxAttempts) {
      const randomDigits = Math.floor(1000 + Math.random() * 5500);
      username = `S-S${randomDigits}investor`;
      const existing = await User.findOne({ where: { username } });
      if (!existing) {
        isUnique = true;
        break;
      }
      attempts++;
    }
    if (!isUnique) {
      const timestamp = Date.now().toString().slice(-6);
      username = `S-S${timestamp}investor`;
    }

    // ✅ Store password as plain text (no hashing)
    const plainPassword = password;

    const user = await User.create({
      username,
      email,
      phone,
      password: plainPassword,
    });

    await VerificationCode.destroy({ where: { id: record.id } });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: user.id, username: user.username, email: user.email },
      generatedUsername: user.username,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier, password } = req.body;
    const trimmedIdentifier = identifier?.trim() || '';
    const trimmedPassword = password?.trim() || '';

    if (!trimmedIdentifier || !trimmedPassword) {
      return res.status(400).json({ message: 'Identifier and password are required' });
    }

    // 1️⃣ Check if identifier matches an admin email
    const admin = await Admin.findOne({ where: { email: trimmedIdentifier } });
    if (admin) {
      // Admin: password must match either phone1 or phone2
      if (trimmedPassword === admin.phone1 || trimmedPassword === admin.phone2) {
        const token = jwt.sign(
          { id: admin.id, role: 'admin' },
          process.env.JWT_SECRET!,
          { expiresIn: '7d' }
        );
        return res.json({
          token,
          user: {
            id: admin.id,
            username: 'Admin',
            email: admin.email,
            role: 'admin',
          },
        });
      } else {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    }

    // 2️⃣ If not admin, check regular user
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: trimmedIdentifier }, { username: trimmedIdentifier }],
      },
    });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (trimmedPassword !== user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: 'user' }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: 'user' } });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// Forgot Password – send verification code
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Email does not exist' });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await VerificationCode.destroy({ where: { email } });
    await VerificationCode.create({ email, code, expiresAt });

    await sendVerificationEmail(email, code);

    res.status(200).json({ message: 'Verification code sent to your email' });
  } catch (err: any) {
    console.error('forgotPassword error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Reset Password – verify code and update password (plain text)
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, code, and new password are required' });
    }

    const record = await VerificationCode.findOne({ where: { email, code } });
    if (!record) {
      return res.status(400).json({ message: 'Invalid or missing verification code' });
    }
    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Verification code expired' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password (plain text – no hashing)
    user.password = newPassword;
    await user.save();

    await VerificationCode.destroy({ where: { email, code } });

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err: any) {
    console.error('resetPassword error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ✅ Verify referral code
export const verifyReferral = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { referralCode } = req.body; // username
    const userId = req.userId;

    if (!referralCode) {
      return res.status(400).json({ message: 'Referral code (username) is required' });
    }

    const currentUser = await User.findByPk(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (currentUser.bonus === 'used') {
      return res.status(400).json({ message: 'You have already used a referral code' });
    }

    const referredUser = await User.findOne({ where: { username: referralCode.trim() } });
    if (!referredUser) {
      return res.status(404).json({ message: 'Invalid referral code' });
    }

    if (referredUser.id === userId) {
      return res.status(400).json({ message: 'You cannot refer yourself' });
    }

    // Update current user
    currentUser.balance = parseFloat(currentUser.balance.toString()) + 1500;
    currentUser.bonus = 'used';
    await currentUser.save();

    // Record deposit for referral bonus
    await Deposit.create({
      userId: currentUser.id,
      amount: 1500,
      type: 'referral',
      description: 'Referral bonus ₦1,500',
    });

    // Increment referred user's referrals count
    referredUser.referrals = (referredUser.referrals || 0) + 1;
    await referredUser.save();

    res.status(200).json({
      message: 'Verification successful! You have won ₦1500!',
      newBalance: currentUser.balance,
    });
  } catch (err: any) {
    console.error('verifyReferral error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// UPDATE BANK DETAILS
export const updateBankDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accountNumber, accountName, bankName } = req.body;
    const userId = req.userId;

    if (!accountNumber || !accountName || !bankName) {
      return res.status(400).json({ message: 'All bank details are required' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.accountNumber = accountNumber.trim();
    user.accountName = accountName.trim();
    user.bankName = bankName.trim();
    await user.save();

    res.json({ message: 'Bank details updated successfully', user });
  } catch (err) {
    next(err);
  }
};

// ✅ WITHDRAWAL REQUEST – deduct balance and create pending record
export const requestWithdrawal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount } = req.body;
    const userId = req.userId;

    if (!amount || amount < 5500) {
      return res.status(400).json({ message: 'Minimum withdrawal amount is ₦5,500' });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.accountNumber || !user.accountName || !user.bankName) {
      return res.status(400).json({ message: 'Please add your bank details first' });
    }
    if (Number(user.balance) < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // ✅ Nigeria time check (unchanged)
    const now = new Date();
    const nigeriaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
    const day = nigeriaTime.getDay();
    const hours = nigeriaTime.getHours();

    if (day === 0 || day === 6) {
      return res.status(400).json({ message: 'Withdrawals are not allowed on weekends (Saturday & Sunday)' });
    }
    if (hours < 10 || hours >= 18) {
      return res.status(400).json({
        message: 'Withdrawals are only processed Monday to Friday, 10:00 AM - 6:00 PM (Nigeria time)'
      });
    }

    // ✅ Deduct balance BEFORE creating withdrawal
    user.balance = Number(user.balance) - Number(amount);
    await user.save();

    // Create pending withdrawal record
    await Withdrawal.create({
      userId: user.id,
      amount,
      bankName: user.bankName,
      accountNumber: user.accountNumber,
      accountName: user.accountName,
      status: 'pending',
    });

    res.json({
      message: 'Withdrawal request submitted. Pending approval.',
      pending: true,
      newBalance: user.balance,
    });
  } catch (err) {
    next(err);
  }
};
// ✅ GET TRANSACTION HISTORY
export const getHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const deposits = await Deposit.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
    const withdrawals = await Withdrawal.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
    res.json({ deposits, withdrawals });
  } catch (err) {
    next(err);
  }
};

/// ✅ Get all pending withdrawals (admin only)
export const getPendingWithdrawals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pending = await Withdrawal.findAll({
      where: { status: 'pending' },
      include: [{ model: User, attributes: ['username', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(pending);
  } catch (err) {
    next(err);
  }
};

// ✅ Approve a withdrawal
export const approveWithdrawal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const withdrawal = await Withdrawal.findByPk(id);
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }
    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: 'Withdrawal already processed' });
    }
    withdrawal.status = 'approved';
    await withdrawal.save();
    res.json({ message: 'Withdrawal approved successfully', withdrawal });
  } catch (err) {
    next(err);
  }
};

// ✅ Reject a withdrawal
export const rejectWithdrawal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const withdrawal = await Withdrawal.findByPk(id);
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }
    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: 'Withdrawal already processed' });
    }
    withdrawal.status = 'rejected';
    await withdrawal.save();

    // Optionally refund the amount to the user
    const user = await User.findByPk(withdrawal.userId);
    if (user) {
      user.balance = Number(user.balance) + Number(withdrawal.amount);
      await user.save();
    }

    res.json({ message: 'Withdrawal rejected and amount refunded', withdrawal });
  } catch (err) {
    next(err);
  }
};

// GET LEADERBOARD – top users by referrals
export const getLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'referrals'],
      order: [['referrals', 'DESC']],
      limit: 50,
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// ✅ DAILY CHECK – add ₦50 bonus with 24h cooldown
export const dailyCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const now = new Date();
    const lastCheck = user.lastDailyCheck;

    if (lastCheck) {
      const diff = now.getTime() - new Date(lastCheck).getTime();
      const hoursDiff = diff / (1000 * 60 * 60);
      if (hoursDiff < 24) {
        const remainingMs = 24 * 60 * 60 * 1000 - diff;
        const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
        const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        return res.status(400).json({
          message: `Please wait ${remainingHours}h ${remainingMinutes}m before checking again.`,
          remainingMs,
        });
      }
    }

    // Add ₦50
    user.balance = Number(user.balance) + 50;
    user.lastDailyCheck = now;
    await user.save();

    // Record deposit
    await Deposit.create({
      userId: user.id,
      amount: 50,
      type: 'daily_check',
      description: 'Daily check ₦50',
    });

    res.json({
      message: 'Daily check bonus of ₦50 added!',
      newBalance: user.balance,
      nextCheckTime: now.getTime() + 24 * 60 * 60 * 1000,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ Invest in a plan (with active order limit)
export const invest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { planName, amount, dailyIncome, totalIncome, duration } = req.body;
    const userId = req.userId;

    // 1. Find user
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 2. Check active orders limit (max 2)
    const activeOrders = await Order.count({ where: { userId, status: 'active' } });
    if (activeOrders >= 2) {
      return res.status(400).json({
        message: 'You already have 2 active investments. Please wait for them to complete.'
      });
    }

    // 3. Check balance
    if (Number(user.balance) < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // 4. Deduct balance & update user stats
    user.balance = Number(user.balance) - amount;
    user.invest = Number(user.invest) + amount;
    user.orders = Number(user.orders) + 1;
    await user.save();

    // 5. Create order
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);

    const order = await Order.create({
      userId,
      planName,
      amount,
      dailyIncome,
      totalIncome,
      duration,
      startDate,
      endDate,
      status: 'active',
      lastIncomeDate: startDate,
    });

    res.json({ message: 'Investment successful', order, newBalance: user.balance });
  } catch (err) {
    next(err);
  }
};

// ✅ Get user orders
export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const orders = await Order.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// ✅ Create a pending deposit with sender details
export const createDeposit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, description, senderBank, senderAccountNumber, senderAccountName } = req.body;
    const userId = req.userId;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }
    if (!senderBank || !senderAccountNumber || !senderAccountName) {
      return res.status(400).json({ message: 'Sender bank details are required' });
    }
    const deposit = await Deposit.create({
      userId,
      amount,
      type: 'deposit',
      description: description || `Deposit of ₦${amount}`,
      status: 'pending',
      senderBank,
      senderAccountNumber,
      senderAccountName,
    });
    res.json({ message: 'Deposit recorded successfully', deposit });
  } catch (err) {
    next(err);
  }
};

// ✅ Admin: Get pending deposits
export const getPendingDeposits = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deposits = await Deposit.findAll({
      where: { status: 'pending', type: 'deposit' },
      include: [{ model: User, attributes: ['id', 'username', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(deposits);
  } catch (err) {
    next(err);
  }
};

// ✅ Admin: Approve deposit
export const approveDeposit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deposit = await Deposit.findByPk(id);
    if (!deposit) return res.status(404).json({ message: 'Deposit not found' });
    if (deposit.status !== 'pending') {
      return res.status(400).json({ message: 'Deposit already processed' });
    }
    deposit.status = 'verified';
    await deposit.save();
    // Optionally add amount to user balance
    const user = await User.findByPk(deposit.userId);
    if (user) {
      user.balance = Number(user.balance) + Number(deposit.amount);
      await user.save();
    }
    res.json({ message: 'Deposit approved and balance updated', deposit });
  } catch (err) {
    next(err);
  }
};

// ✅ Admin: Reject deposit
export const rejectDeposit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deposit = await Deposit.findByPk(id);
    if (!deposit) return res.status(404).json({ message: 'Deposit not found' });
    if (deposit.status !== 'pending') {
      return res.status(400).json({ message: 'Deposit already processed' });
    }
    deposit.status = 'rejected';
    await deposit.save();
    res.json({ message: 'Deposit rejected', deposit });
  } catch (err) {
    next(err);
  }
};