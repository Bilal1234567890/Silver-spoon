import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { sequelize } from './db.js';
import User from './User.js';
import VerificationCode from './VerificationCode.js';
import generateCode from './generateCode.js';
import sendVerificationEmail from './sendEmail.js';

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
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
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

    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: trimmedIdentifier }, { username: trimmedIdentifier }],
      },
    });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // ✅ Plain‑text comparison (no bcrypt)
    if (trimmedPassword !== user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
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

// ✅ NEW: Verify referral code
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

// WITHDRAWAL REQUEST
export const requestWithdrawal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount } = req.body;
    const userId = req.userId;

    // Check minimum
    if (!amount || amount < 9000) {
      return res.status(400).json({ message: 'Minimum withdrawal amount is ₦9,000' });
    }

    // Check if the user has bank details
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!user.accountNumber || !user.accountName || !user.bankName) {
      return res.status(400).json({ message: 'Please add your bank details first' });
    }

    // Check if balance is sufficient
    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Check time and day
    const now = new Date();
    const day = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // No withdrawal on weekends
    if (day === 0 || day === 6) {
      return res.status(400).json({ message: 'Withdrawals are not allowed on weekends (Saturday & Sunday)' });
    }

    // No withdrawal outside 10:00 AM - 6:00 PM
    if (hours < 10 || (hours === 18 && minutes > 0) || hours > 18) {
      return res.status(400).json({ message: 'Withdrawals are only processed Monday to Friday, 10:00 AM - 6:00 PM' });
    }

    // Deduct balance (simulate withdrawal)
    user.balance = Number(user.balance) - Number(amount);
    await user.save();

    // Here you would create a withdrawal transaction record (optional)
    res.json({ message: `Withdrawal of ₦${amount} processed successfully`, newBalance: user.balance });
  } catch (err) {
    next(err);
  }
};