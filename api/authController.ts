import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { sequelize } from './db';
import User from './User';
import VerificationCode from './VerificationCode';
import generateCode from './generateCode';
import sendVerificationEmail from './sendEmail';

export const sendCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, phone } = req.body;

    if (!email || !phone) {
      return res.status(400).json({ message: 'Email and phone are required' });
    }

    // Check duplicates
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    // Generate and store code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await VerificationCode.destroy({ where: { email } });
    await VerificationCode.create({ email, code, expiresAt });

    // Try to send email
    try {
      await sendVerificationEmail(email, code);
      res.status(200).json({ message: 'Verification code sent to your email' });
    } catch (emailError: any) {
      console.error('📧 Email error:', emailError);
      // Even if email fails, the code is stored
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

// ... rest of the controller (register, login, getMe)y

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
    let username = ''; // ✅ FIX 3: Initialized to avoid 'used before assigned' error
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

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      phone,
      password: hashed,
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

    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: identifier }, { username: identifier }],
      },
    });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.userId, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};