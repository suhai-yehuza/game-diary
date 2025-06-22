import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginJsxA11y from 'eslint-plugin-jsx-a11y';
import eslintPluginFilenames from 'eslint-plugin-filenames';
import eslintConfigPrettier from 'eslint-config-prettier';
import nextPlugin from '@next/eslint-plugin-next/dist/index.js';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import filenamesPlugin from 'eslint-plugin-filenames';
import globals from 'globals';

export default [
  // Global ignores - must be first
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '.nyc_output/**',
      'public/**',
      'src/lib/types/generated/**',
      'lib/**',
      'scripts/**',
      '*.config.js',
      '*.config.ts',
      '*.config.mjs',
      '*.config.cjs',
      '*.log',
      'npm-debug.log*',
      'pnpm-debug.log*',
      'test-results-e2e/**',
      'playwright-report/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      import: eslintPluginImport,
      react: eslintPluginReact,
      'react-hooks': eslintPluginReactHooks,
      'jsx-a11y': eslintPluginJsxA11y,
      filenames: filenamesPlugin,
      '@next/next': nextPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      // React and React Hooks rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Import rules
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-duplicates': ['error', { considerQueryString: true, 'prefer-inline': false }],
      'import/no-unresolved': ['error', { ignore: ['^@src/', '^@lib/'] }],
      'import/named': 'error',

      // TypeScript rules
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
          fixStyle: 'separate-type-imports',
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          prefix: ['I'],
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
        },
        {
          selector: 'enum',
          format: ['PascalCase'],
        },
      ],

      // Filename rules
      // 'filenames/match-regex': ['error', '^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$'],
      // 'filenames/match-exported': ['error', 'pascal'],

      // Next.js specific rules
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-img-element': 'warn',
      '@next/next/no-unwanted-polyfillio': 'error',

      // Accessibility rules
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/anchor-has-content': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/aria-props': 'warn',
      'jsx-a11y/aria-role': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'warn',
      'jsx-a11y/role-supports-aria-props': 'warn',

      // General rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'no-duplicate-imports': 'off', // Handled by import/no-duplicates with better type support
      'no-unused-expressions': 'warn',
      'no-unused-vars': 'off', // Turn off base rule as it can report incorrect errors
    },
  },
  {
    files: ['src/**/*.tsx'],
    rules: {
      // 'filenames/match-regex': ['error', '^[A-Z][a-zA-Z0-9]*$'],
      // 'filenames/match-exported': ['error', 'pascal'],
    },
  },
  {
    files: ['src/app/**/*.tsx'],
    rules: {
      // 'filenames/match-regex': ['error', '^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$'],
      // 'filenames/match-exported': 'off',
    },
  },
  {
    files: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    rules: {
      // 'filenames/match-regex': ['error', '^[a-z][a-z0-9]*(?:-[a-z0-9]+)*.test$'],
    },
  },
  {
    files: ['src/**/*.types.ts'],
    rules: {
      // 'filenames/match-regex': ['error', '^[a-z][a-zA-Z0-9]*.types$'],
    },
  },
  eslintConfigPrettier,
  // Move the specific file configuration to the end to ensure it takes precedence
  {
    files: [
      'src/lib/types/graphql.types.ts',
      // 'src/lib/graphql/resolvers/games.ts',
      'src/lib/graphql/resolvers/comments.ts',
      'src/lib/graphql/resolvers/comment.mutations.ts',
      'src/lib/db/seed/fetch-external-api-player-stats.ts',
      'src/lib/db/seed/optimized-external-seeder.ts',
      'src/lib/db/seed/optimized-seeder.ts',
      // 'src/app/sports/nba/games/[id]/page.tsx',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
