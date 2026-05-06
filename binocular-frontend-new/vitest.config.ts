import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import type { Plugin } from 'vite';

/**
 * Stubs all `src/db_export/*.json` imports during testing.
 * The real db_export directory is gitignored (large runtime data) so tests
 * must not depend on its presence. metadata.json gets a minimal fixture with
 * values that match the constants hardcoded in databaseLoaders.test.ts;
 * every other collection file resolves to an empty array.
 */
function dbExportStubPlugin(): Plugin {
  const VIRTUAL_METADATA = '\0db-export-metadata';
  const VIRTUAL_EMPTY = '\0db-export-empty';

  return {
    name: 'db-export-stub',
    enforce: 'pre',
    resolveId(id) {
      if (id.includes('db_export/metadata')) return VIRTUAL_METADATA;
      if (id.includes('db_export/')) return VIRTUAL_EMPTY;
    },
    load(id) {
      if (id === VIRTUAL_METADATA) {
        return `export default ${JSON.stringify({ namespace: 'INSO-World/Binocular', createdAt: '2026-03-20T14:23:44.145Z' })};`;
      }
      if (id === VIRTUAL_EMPTY) {
        return 'export default [];';
      }
    },
  };
}

export default defineConfig({
  plugins: [svgr(), react(), dbExportStubPlugin()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/plugins/visualizationPlugins/**/*.{ts,tsx}',
        'src/components/**/*.{ts,tsx}',
        'src/redux/reducer/**/*.ts',
        'src/redux/middleware/**/*.ts',
        'src/utils/*.{ts,tsx}',
      ],
      exclude: [
        'src/test/**',
        'src/plugins/visualizationPlugins/example',
        'src/plugins/visualizationPlugins/**/index.{ts,tsx}',
        'src/plugins/visualizationPlugins/**/help.tsx',
        'src/plugins/visualizationPlugins/**/src/chart/*.tsx', // could be changed to only Chart.tsx
        'src/plugins/visualizationPlugins/**/src/settings/**',
        'src/plugins/visualizationPlugins/**/src/saga/**',
        'src/components/tabMenu/tabMenuContent/**',
        'src/components/dashboard/reduxSubAppStoreWrapper/**',
      ],
    },
  },
});
