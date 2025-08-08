import { resolve } from 'path';

import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const COVERAGE_THRESHOLD = 60;
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
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
        'src/lib/**',
        'src/app/api/webhook/clerk-example-events/**',
        'src/app/styles/**',
        'src/middleware.ts', // Middleware is tested via e2e
        'src/types/**', // Generated types
        'src/app/api/webhook/clerk-example-events/**', // Example events
        'src/app/styles/globals.css', // CSS files
        'src/app/globals.css', // CSS files
      ],
      thresholds: {
        lines: COVERAGE_THRESHOLD,
        branches: COVERAGE_THRESHOLD,
        functions: COVERAGE_THRESHOLD,
        statements: COVERAGE_THRESHOLD,
      },
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
