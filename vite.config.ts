import { defineConfig, transformWithEsbuild } from "vite";
import react from "@vitejs/plugin-react-swc";
import jsxInJs from "./vite/jsx-in-js";
import { join } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  root: "./ui/",
  server: {
    port: 4200,
  },
  plugins: [
    { // source: https://stackblitz.com/edit/vitejs-vite-ka3qkc?file=vite.config.js
      // source: https://github.com/vitejs/vite/discussions/3448#discussioncomment-5904031
      name: "load+transform-js-files-as-jsx",
      async transform(code, id) {
        if (!id.match(/src\/.*\.js$/)) {
          return null;
        }

        // Use the exposed transform from vite, instead of directly
        // transforming with esbuild
        return transformWithEsbuild(code, id, {
          loader: "jsx",
          jsx: "automatic",
        });
      },
    },
    react(),
  ],
  // esbuild: {
  //   loader: "jsx",
  //   include: /src\/.*\.jsx?$/,
  //   exclude: [],
  // },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
  resolve: {
    alias: [
      { // source: https://github.com/vitejs/vite/issues/382#issuecomment-826318764
        find: /~(.+)/,
        replacement: join(process.cwd(), 'node_modules/$1'),
      },
    ],
  },
});
