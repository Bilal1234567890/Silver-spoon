import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './db.js';
import authRoutes from './authRoutes.js';
import errorHandler from './errorHandler.js';

const app: Express = express();

// ✅ CORS configuration – allow your Vercel frontend
const allowedOrigins = [
  'https://silver-spoon-aq650f9qy-the-web-developers-projects.vercel.app',
  'https://silver-spoon-98y22u710-the-web-developers-projects.vercel.app',
  'https://silver-spoon-jet.vercel.app',
  'http://localhost:5173', // local dev
];

// CORS middleware with dynamic origin
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// ✅ Handle OPTIONS preflight requests for all routes
app.options('*', cors());

connectDB();

app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

export default app;