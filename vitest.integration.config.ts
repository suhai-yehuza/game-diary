import { resolve } from 'path';

import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    include: ['tests/integration/**/*.{test,spec}.{ts,tsx,js,jsx}'],
    exclude: [
      'node_modules/**',
      'dist/**',
      '.next/**',
      'coverage/**',
      'tests/e2e/**',
      'tests/unit/**',
      'src/**/*.{test,spec}.{ts,tsx,js,jsx}',
    ],
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
        'src/lib/graphql/**',
        'src/lib/mock/**',
        'src/lib/types/**',
        'src/app/api/webhook/clerk-example-events/**',
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
