import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginJsxA11y from 'eslint-plugin-jsx-a11y';
import eslintConfigPrettier from 'eslint-config-prettier';
import nextPlugin from '@next/eslint-plugin-next';
import filenamesPlugin from 'eslint-plugin-filenames';
import globals from 'globals';
import noDuplicateMainRule from './scripts/eslint-rules/no-duplicate-main.js';

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
      'src/lib/types/**',
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
      'test-results/**',
      'playwright-report/**',
      'vitest.setup.ts',
      '.eslintrc.js',
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
      'custom-rules': {
        rules: {
          'no-duplicate-main': noDuplicateMainRule,
        },
      },
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
      next: {
        rootDir: '.',
      },
    },
    rules: {
      // Next.js recommended/core-web-vitals rules (only valid ones)
      '@next/next/no-html-link-for-pages': ['error', 'src/pages'],
      '@next/next/no-img-element': 'error',
      '@next/next/no-sync-scripts': 'error',
      '@next/next/no-title-in-document-head': 'error',
      '@next/next/no-head-element': 'error',
      '@next/next/no-page-custom-font': 'error',
      '@next/next/no-duplicate-head': 'error',
      '@next/next/no-unwanted-polyfillio': 'error',
      '@next/next/google-font-display': 'error',
      '@next/next/google-font-preconnect': 'error',
      '@next/next/next-script-for-ga': 'error',
      '@next/next/no-before-interactive-script-outside-document': 'error',
      '@next/next/no-css-tags': 'error',
      '@next/next/no-document-import-in-page': 'error',
      '@next/next/no-typos': 'error',
      '@next/next/no-assign-module-variable': 'error',
      '@next/next/no-styled-jsx-in-document': 'error',
      '@next/next/no-head-import-in-document': 'error',
      '@next/next/no-script-component-in-head': 'error',
      '@next/next/inline-script-id': 'error',
      '@next/next/no-async-client-component': 'error',
      // React and React Hooks rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/no-array-index-key': 'warn',
      'react/no-danger': 'warn',
      'react/no-deprecated': 'error',
      'react/no-direct-mutation-state': 'error',
      'react/no-find-dom-node': 'error',
      'react/no-is-mounted': 'error',
      'react/no-render-return-value': 'error',
      'react/no-string-refs': 'error',
      'react/no-unescaped-entities': 'error',
      'react/no-unknown-property': 'error',
      'react/no-unsafe': ['error', { checkAliases: true }],
      'react/self-closing-comp': 'error',
      'react/sort-comp': 'error',
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
      'import/no-unresolved': ['error', { ignore: ['^@/', '^@src/', '^@lib/'] }],
      'import/named': 'error',
      'import/no-default-export': 'off',
      'import/no-named-as-default': 'warn',
      'import/no-unused-modules': 'error',
      'import/no-relative-parent-imports': 'off',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*'],
              message:
                'Use alias imports (@/, @src/, @lib/, @tests/, @scripts/) instead of cross-directory relative imports',
            },
            {
              group: ['../../*'],
              message:
                'Use alias imports (@/, @src/, @lib/, @tests/, @scripts/) instead of cross-directory relative imports',
            },
            {
              group: ['../../../*'],
              message:
                'Use alias imports (@/, @src/, @lib/, @tests/, @scripts/) instead of cross-directory relative imports',
            },
            {
              group: ['../../../../*'],
              message:
                'Use alias imports (@/, @src/, @lib/, @tests/, @scripts/) instead of cross-directory relative imports',
            },
          ],
        },
      ],
      // TypeScript rules - temporarily relaxed for build
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
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
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'off', // Disable this rule globally
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/return-await': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/restrict-template-expressions': 'error',
      '@typescript-eslint/no-base-to-string': 'error',
      '@typescript-eslint/prefer-readonly': 'warn',
      '@typescript-eslint/no-array-constructor': 'error',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/no-namespace': 'error',
      '@typescript-eslint/no-this-alias': 'error',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/prefer-function-type': 'error',
      '@typescript-eslint/prefer-includes': 'error',
      '@typescript-eslint/prefer-namespace-keyword': 'error',
      '@typescript-eslint/prefer-reduce-type-parameter': 'error',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      '@typescript-eslint/triple-slash-reference': 'error',
      '@typescript-eslint/type-annotation-spacing': 'error',
      '@typescript-eslint/unbound-method': 'error',
      '@typescript-eslint/unified-signatures': 'error',
      // Rules from legacy .eslintrc.js
      'jsx-a11y/no-redundant-roles': 'error',
      'custom-rules/no-duplicate-main': 'error',
    },
  },
  // Test files configuration - less strict TypeScript rules for mocking
  {
    files: ['tests/**/*.{ts,tsx}', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@next/next/no-img-element': 'off',
      'react/no-array-index-key': 'off',
      'import/no-unresolved': 'off',
    },
  },
  {
    files: ['src/**/*.tsx'],
    rules: {
      // removed filenames rules
    },
  },
  {
    files: ['src/app/**/*.tsx'],
    rules: {
      // removed filenames rules
    },
  },
  {
    files: ['src/**/*.types.ts'],
    rules: {
      // removed filenames rules
    },
  },
  {
    files: ['src/**/*.api.ts', 'src/**/*.api.tsx'],
    rules: {
      // removed filenames rules
    },
  },
  {
    files: ['src/lib/graphql/**/*.ts'],
    rules: {
      'max-lines-per-function': 'off',
      complexity: 'off',
    },
  },
  {
    files: ['src/hooks/use-api-cache.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
  // User resolver - allow boolean OR logic and relax unsafe type rules
  {
    files: ['src/lib/graphql/resolvers/user.ts'],
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  // Middleware and services - relax unsafe type rules
  {
    files: [
      'src/lib/middleware/**/*.ts',
      'src/lib/services/**/*.ts',
      'src/lib/utils/**/*.ts',
      'src/middleware.ts',
    ],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  // GraphQL resolvers - relax unsafe type rules and nullish coalescing
  {
    files: ['src/lib/graphql/resolvers/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
  // Database and seed files - relax unsafe type rules
  {
    files: ['src/lib/db/**/*.ts', 'src/lib/graphql/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  // Hooks and app files - relax unsafe type rules
  {
    files: ['src/hooks/**/*.ts', 'src/app/**/*.tsx', 'src/lib/cache/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  eslintConfigPrettier,
];
