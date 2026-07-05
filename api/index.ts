import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

console.log('📦 Loading backend modules...');

import { connectDB } from './db.js';
import authRoutes from './authRoutes.js';
import errorHandler from './errorHandler.js';

const app: Express = express();

// ✅ CORS – allow all origins (explicit headers)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    console.log('🔄 OPTIONS request received for:', req.url);
    return res.sendStatus(204);
  }
  next();
});

// ✅ Connect to database (non-blocking, logs errors but doesn't crash)
connectDB()
  .then(() => {
    console.log('✅ Database connected and synced');
  })
  .catch((err) => {
    console.error('❌ Database connection failed (will continue):', err.message);
    // We don't exit the process – the app will still run,
    // but endpoints that need DB will fail.
  });

app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

console.log('✅ Backend initialized');

export default app;