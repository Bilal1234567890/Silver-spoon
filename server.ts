import dotenv from 'dotenv';
dotenv.config();

console.log('🚀 Starting server...');

try {
  const appModule = await import('./api/index.js');
  const app = appModule.default;
  const PORT = process.env.PORT || 5000;

  const server = app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
  });

  server.on('error', (err) => {
    console.error('❌ Server error:', err);
    process.exit(1);
  });
} catch (err) {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
}