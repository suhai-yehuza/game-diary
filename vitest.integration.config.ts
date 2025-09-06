import { resolve } from 'path';

import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    isolate: true,
    pool: 'forks',
    include: ['tests/integration/**/*.{test,spec}.{ts,tsx,js,jsx}'],
    exclude: [
      'node_modules/**',
      'dist/**',
      '.next/**',
      'coverage/**',
      'tests/e2e/**',
      'tests/unit/**',
    ],
    testTimeout: 2 * 60 * 1000,
    hookTimeout: 2 * 60 * 1000,
    environmentOptions: {
      jsdom: {
        resources: 'usable',
        pretendToBeVisual: true,
      },
    },
  },
  resolve: {
    alias: [
      { find: '@/types', replacement: resolve(__dirname, 'types/index.ts') },
      { find: '@types', replacement: resolve(__dirname, 'types/index.ts') },
      { find: '@src', replacement: resolve(__dirname, 'src') },
      { find: '@lib', replacement: resolve(__dirname, 'lib') },
      { find: '@utils', replacement: resolve(__dirname, 'scripts/utils') },
      { find: '@', replacement: resolve(__dirname, 'src') },
      { find: '@scripts', replacement: resolve(__dirname, 'scripts') },
      { find: '@tests', replacement: resolve(__dirname, 'tests') },
      { find: '@app', replacement: resolve(__dirname, 'src/app') },
    ],
  },
  plugins: [tsconfigPaths()],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'test'),
  },
});
