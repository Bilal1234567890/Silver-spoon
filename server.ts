import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 Loading app...');
import app from './api/index.js';

const PORT = process.env.PORT || 5000;

console.log(`🔍 Attempting to start server on port ${PORT}`);
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('❌ Server startup error:', err);
});