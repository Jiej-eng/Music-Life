import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: __dirname,
  cacheDir: path.join(__dirname, '.vite-cache'),
  plugins: [react()],
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react']
  }
});