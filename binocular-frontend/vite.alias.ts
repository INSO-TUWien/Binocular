import { join } from 'path';
export const alias = [
  {
    // source: https://github.com/vitejs/vite/issues/382#issuecomment-826318764
    find: /~(.+)/,
    replacement: join(process.cwd(), 'node_modules/$1'),
  },
];
