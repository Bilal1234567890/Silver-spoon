import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as Sequelize from 'sequelize';
const Op = Sequelize.Op;
import User from './User.js';
import VerificationCode from './VerificationCode.js';
import generateCode from './generateCode.js';
import { sendVerificationEmail } from './sendEmail.js';

export const sendCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, phone } = req.body;
    if (!email || !phone) {
      return res.status(400).json({ message: 'Email and phone are required' });
    }
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) return res.status(400).json({ message: 'Email already registered' });
    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) return res.status(400).json({ message: 'Phone number already registered' });

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await VerificationCode.destroy({ where: { email } });
    await VerificationCode.create({ email, code, expiresAt });

  try {
  await sendVerificationEmail(email, code);
} catch (emailError: any) {
  console.error('Email sending failed:', emailError);
  // Return the actual error message to the frontend for debugging
  return res.status(500).json({
    message: 'Failed to send verification email.',
    error: emailError.message, // ← now you'll see the real reason
  });
}
    res.status(200).json({ message: 'Verification code sent to your email' });
  } catch (err: any) {
    console.error('sendCode error:', err);
    res.status(500).json({ message: 'Server error while sending code', error: err.message });
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, phone, password, code } = req.body;

    const record = await VerificationCode.findOne({ where: { email, code } });
    if (!record) return res.status(400).json({ message: 'Invalid or missing verification code' });
    if (record.expiresAt < new Date()) return res.status(400).json({ message: 'Verification code expired' });

    // Generate username
    let username = 'S-S0000investor';
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

    const user = await User.create({ username, email, phone, password });
    await VerificationCode.destroy({ where: { email, code } });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      username: user.username,
      generatedUsername: user.username,
      user: { username: user.username },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier, password } = req.body;

    // Trim inputs
    const trimmedIdentifier = identifier?.trim() || '';
    const trimmedPassword = password?.trim() || '';

    console.log('🔍 Login attempt with identifier:', trimmedIdentifier);
    console.log('🔍 Password provided:', trimmedPassword);

    if (!trimmedIdentifier || !trimmedPassword) {
      return res.status(400).json({ message: 'Identifier and password are required' });
    }

    // Find user
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: trimmedIdentifier }, { username: trimmedIdentifier }],
      },
    });

    if (!user) {
      console.log('❌ No user found with that identifier');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('✅ User found:', { id: user.id, username: user.username, email: user.email });
    console.log('🔍 Stored password in DB:', user.password);
    console.log('🔍 Provided password:', trimmedPassword);

    // Compare
    if (trimmedPassword !== user.password) {
      console.log('❌ Password mismatch');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('✅ Login successful');

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