import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react-swc';
import autoprefixer from 'autoprefixer';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import { alias as viteAlias } from './vite.alias';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { viteSingleFile } from 'vite-plugin-singlefile';
import ConditionalCompile from 'vite-plugin-conditional-compiler';

// https://vitejs.dev/config/
export default () => {
  const isOfflineBuild = () => process.env.VITE_OFFLINE !== undefined && process.env.VITE_OFFLINE.trim() === 'true';

  return defineConfig({
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
      minify: 'esbuild',
      sourcemap: false, //generating the sourcemap uses way too much memory
      commonjsOptions: {
        include: /node_modules/,
        requireReturnsDefault: 'auto',
      },
      emptyOutDir: true,
      outDir: '../dist',
      rollupOptions: {
        cache: false,
        treeshake: false,
        output: {
          format: 'esm',
        },
        plugins: [
          nodeResolve({
            browser: true,
          }),
        ],
      },
    },
    plugins: [
      nodePolyfills(),
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
      ConditionalCompile({ include: ['./src/database/localDB.js'] }),
      isOfflineBuild() && viteSingleFile(),
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
};
