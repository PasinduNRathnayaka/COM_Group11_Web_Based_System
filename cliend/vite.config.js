import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  /* 👇 add this */
  server: {
    proxy: {
      // any request that starts with /api
      '/api': 'http://localhost:4000',   // ← 4000 is your backend PORT
    },
  },
});

