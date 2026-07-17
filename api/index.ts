import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

console.log('📦 Backend initializing...');

import { connectDB } from './db.js';
import authRoutes from './authRoutes.js';
import errorHandler from './errorHandler.js';
import Admin from './Admin.js';

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

// ✅ Database connection + seeding
connectDB()
  .then(async () => {
    console.log('✅ Database connected and synced');

    // Seed default admin
    try {
      const [admin, created] = await Admin.findOrCreate({
        where: { email: 'admin@silverspoon.com' },
        defaults: {
          email: 'admin@silverspoon.com',
          phone1: '080829911',
          phone2: '08064604280',
        },
      });
      if (created) console.log('✅ Default admin created');
      else console.log('ℹ️ Admin already exists');
    } catch (err) {
      console.error('❌ Failed to seed admin:', err);
    }
  })
  .catch((err) => console.error('❌ DB connection error:', err.message));

app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

console.log('✅ Backend ready');

export default app;