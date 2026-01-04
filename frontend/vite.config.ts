import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api1': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api1/, ''),
      },
      '/api2': {
        target: 'http://localhost:8002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api2/, ''),
      },
      '/api3': {
        target: 'http://localhost:8003',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api3/, ''),
      },
    },
  },
});
