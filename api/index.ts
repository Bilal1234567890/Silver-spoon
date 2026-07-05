import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

console.log('📦 Backend initializing...');

import { connectDB } from './db.js';
import authRoutes from './authRoutes.js';
import errorHandler from './errorHandler.js';

const app: Express = express();

// ✅ CORS – allow all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ✅ Explicit OPTIONS handler
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(204);
});

// ✅ Database – non‑blocking, logs errors but doesn't crash
connectDB()
  .then(() => console.log('✅ Database connected and synced'))
  .catch((err) => console.error('❌ DB connection error:', err.message));

app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

console.log('✅ Backend ready');

export default app;