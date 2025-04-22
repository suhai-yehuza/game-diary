import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import { defineConfig } from 'eslint/config';

export default defineConfig({
  files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
  plugins: {
    js,
    '@typescript-eslint': tseslint.plugin,
    react: pluginReact,
  },
  languageOptions: {
    globals: globals.browser,
    parser: tseslint.parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  rules: {
    ...tseslint.configs.recommended.rules,
    ...pluginReact.configs.recommended.rules,
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'react/react-in-jsx-scope': 'warn',
    'react/prop-types': 'warn',
  },
});
