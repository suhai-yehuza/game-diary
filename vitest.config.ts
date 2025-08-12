import { resolve } from 'path';

import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

import { getVitestThresholds } from './src/lib/config/coverage';
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    isolate: true,
    pool: 'forks',
    include: [
      'tests/unit/**/*.{test,spec}.{ts,tsx,js,jsx}',
      'tests/integration/**/*.{test,spec}.{ts,tsx,js,jsx}',
      'src/**/*.{test,spec}.{ts,tsx,js,jsx}',
    ],
    exclude: ['node_modules/**', 'dist/**', '.next/**', 'coverage/**', 'tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '.next/**',
        'coverage/**',
        'tests/**',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/vitest.setup.ts',
        '**/next.config.js',
        '**/tailwind.config.ts',
        '**/postcss.config.mjs',
        '**/drizzle.config.ts',
        '**/codegen.ts',
        '**/playwright.config.ts',
        'src/app/api/webhook/clerk-example-events/**',
        'src/styles/**', // CSS files
        'src/middleware.ts', // Middleware is tested via e2e
        'src/lib/cache/**',
        'src/lib/config/**',
        'src/lib/db/**',
        'src/lib/errors/**',
        'src/lib/graphql/**',
        'src/lib/middleware/**',
        'src/lib/mock/**',
        'src/lib/services/**',
        'src/lib/types/**',
        'src/lib/utils/**',
        'src/lib/validations/**',
      ],
      thresholds: getVitestThresholds(),
      all: false,
    },
    testTimeout: 10000,
    hookTimeout: 10000,
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
    'process.env.NODE_ENV': '"test"',
  },
});
