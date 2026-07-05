import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './db.js';
import authRoutes from './authRoutes.js';
import errorHandler from './errorHandler.js';

const app: Express = express();

// ✅ Connect to database BEFORE routes
connectDB();

// ✅ CORS middleware – allow all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ✅ Explicitly handle OPTIONS requests for all routes
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(204);
});

// ✅ Parse JSON after CORS
app.use(express.json());

// ✅ Routes
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ✅ Error handler
app.use(errorHandler);

export default app;