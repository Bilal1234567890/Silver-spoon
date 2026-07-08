import dotenv from 'dotenv';
import './api/cron.js';
dotenv.config();

console.log('🚀 Starting server...');

import app from './api/index.js';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

// Keep the process alive (prevents premature exit)
server.on('listening', () => {
  console.log('✅ Server is listening for connections');
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('🔥 Unhandled Rejection:', err);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing...');
  server.close(() => process.exit(0));
});