import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react-swc';
// import react from "@vitejs/plugin-react";
import autoprefixer from 'autoprefixer';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';
import { nodeResolve } from '@rollup/plugin-node-resolve';
// import { builtinModules, createRequire } from "module";
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import { alias as viteAlias } from './vite.alias';
//import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  root: './',
  base: '',
  server: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:48763/',
        secure: false,
      },
      '/graphQl': {
        target: 'http://localhost:48763/',
        secure: false,
        changeOrigin: true,
      },
      '/wsapi': {
        target: 'ws://localhost:48763',
        ws: true,
      },
    },
  },
  build: {
    minify: false,
    sourcemap: true,
    commonjsOptions: {
      include: /node_modules/,
      requireReturnsDefault: 'auto',
    },
    outDir: './dist',
    rollupOptions: {
      cache: false,
      output: {
        format: 'iife',
      },
      plugins: [
        rollupNodePolyFill({
          sourceMap: true,
          crypto: true,
        }),
        nodeResolve({
          browser: true,
        }),
        // commonjs(),
      ],
    },
  },
  plugins: [
    {
      // source: https://stackblitz.com/edit/vitejs-vite-ka3qkc?file=vite.config.js
      // source: https://github.com/vitejs/vite/discussions/3448#discussioncomment-5904031
      name: 'load+transform-js-files-as-jsx',
      async transform(code, id) {
        if (!id.match(/src\/.*\.js$/)) {
          return null;
        }

        // Use the exposed transform from vite, instead of directly
        // transforming with esbuild
        return transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'automatic',
        });
      },
    },
    react(),
  ],
  css: {
    postcss: {
      plugins: [
        autoprefixer({}), // add options if needed
      ],
    },
  },
  optimizeDeps: {
    disabled: 'build',
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
  resolve: {
    alias: viteAlias,
  },
});
