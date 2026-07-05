import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // Development server proxy (local only)
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },

  // Build configuration
  build: {
    outDir: 'dist', // ensures the build output is 'dist'
    sourcemap: false, // disable for smaller bundles
    rollupOptions: {
      output: {
        // Manual chunking to reduce main bundle size
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          three: ['three'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // increase limit if needed
  },

  // Base path (default is '/')
  base: '/',
});