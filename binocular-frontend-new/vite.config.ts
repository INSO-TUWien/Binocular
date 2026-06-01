import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import ConditionalCompile from 'vite-plugin-conditional-compiler';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
const backendHost = process.env.BACKEND_URL ?? 'localhost';
export default defineConfig({
  server: {
    port: 8080,
    proxy: {
      '/api': {
        target: `http://${backendHost}:48763/`,
        secure: false,
      },
      '/graphQl': {
        target: `http://${backendHost}:48763/`,
        secure: false,
        changeOrigin: true,
      },
      '/wsapi': {
        target: `ws://${backendHost}:48763`,
        ws: true,
      },
    },
  },
  plugins: [nodePolyfills(), react(), ConditionalCompile(), viteSingleFile()],
  build: {
    emptyOutDir: true,
    outDir: '../dist',
  },
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
  worker: {
    format: 'es',
  },
});
