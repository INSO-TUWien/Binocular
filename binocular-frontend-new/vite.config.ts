import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8080,
    watch: {
      usePolling: true,
    },
    proxy: {
      '/graphQl': {
        target: 'http://localhost:48763/',
        secure: false,
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
});
