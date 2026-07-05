import express, { Express } from 'express';
import dotenv from 'dotenv';
dotenv.config();

console.log('📦 Loading backend modules...');

import { connectDB } from './db.js';
import authRoutes from './authRoutes.js';
import errorHandler from './errorHandler.js';

const app: Express = express();

// ✅ CORS – MUST be first
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    console.log('🔄 OPTIONS request:', req.url);
    return res.sendStatus(204);
  }
  next();
});

// ✅ Connect to DB (non‑blocking, logs error but doesn't crash)
connectDB()
  .then(() => console.log('✅ Database connected and synced'))
  .catch((err) => console.error('❌ DB connection error:', err.message));

app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

console.log('✅ Backend initialized');

export default app;