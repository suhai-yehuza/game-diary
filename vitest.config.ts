import { resolve } from 'path';

import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    include: [
      'tests/unit/**/*.{test,spec}.{ts,tsx,js,jsx}',
      'src/**/*.{test,spec}.{ts,tsx,js,jsx}',
    ],
    exclude: ['node_modules/**', 'dist/**', '.next/**', 'coverage/**', 'tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'lcov'],
      reportsDirectory: './coverage',
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
        'src/lib/types/generated/**',
        'src/app/api/**', // API routes are tested via e2e
        'src/app/styles/**',
        'src/middleware.ts', // Middleware is tested via e2e
      ],
      thresholds: {
        global: {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        './src/': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
      },
      all: true,
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@src': resolve(__dirname, 'src'),
      '@lib': resolve(__dirname, 'lib'),
      '@utils': resolve(__dirname, 'scripts/utils'),
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [tsconfigPaths()],
});
