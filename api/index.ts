import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './db.js';
import authRoutes from './authRoutes.js';
import errorHandler from './errorHandler.js';

const app: Express = express();

// ✅ SIMPLEST CORS: allow any origin
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ✅ Explicitly handle OPTIONS for all routes
app.options('*', cors());

connectDB();

app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

export default app;