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
    alias: {
      '@src': resolve(__dirname, 'src'),
      '@lib': resolve(__dirname, 'lib'),
      '@utils': resolve(__dirname, 'scripts/utils'),
      '@': resolve(__dirname, 'src'),
      '@scripts': resolve(__dirname, 'scripts'),
      '@tests': resolve(__dirname, 'tests'),
      '@app': resolve(__dirname, 'src/app'),
    },
  },
  plugins: [tsconfigPaths()],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'test'),
  },
});
