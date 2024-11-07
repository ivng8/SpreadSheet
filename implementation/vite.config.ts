import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: './src',
  base: '/',
  resolve: {
    alias: {
      'model': resolve(__dirname, './src/model'),
      'view': resolve(__dirname, './src/view'),
      '@': resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: '../../../dist',
    emptyOutDir: true,
    sourcemap: true
  }
});
