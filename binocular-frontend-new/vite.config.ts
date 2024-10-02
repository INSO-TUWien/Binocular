import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
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
  optimizeDeps: {
    exclude: [],
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
      // resolveExtensions: ['.tsx', '.ts', '.js']
    },
  },
  define: {
    global: 'globalThis',
  },
});
