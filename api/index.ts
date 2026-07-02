import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './db';
import authRoutes from './authRoutes';
import errorHandler from './errorHandler';

const app: Express = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

export default app;