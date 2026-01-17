import tanstackQuery from '@tanstack/eslint-plugin-query';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import promise from 'eslint-plugin-promise';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactNative from 'eslint-plugin-react-native';
import reactNativeA11y from 'eslint-plugin-react-native-a11y';
import reactYouMightNotNeedAnEffect from 'eslint-plugin-react-you-might-not-need-an-effect';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  {
    ignores: [
      '**/node_modules/',
      '**/coverage/',
      '**/dist/',
      '**/.expo/',
      '**/build/',
      '**/.cache/',
      '**/*.graphql/*',
      '**/src/graphql/index.ts',
      '**/src/__mocks__/*',
      // '**/*.test.{ts,tsx}',
      '**/metro.config.js',
      '**/babel.config.js',
      'scripts/printStructure.js',
    ],
  },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    plugins: {
      react,
      'react-native': reactNative,
      'react-hooks': reactHooks,
      import: importPlugin,
      '@typescript-eslint': typescriptEslint,
      '@tanstack/query': tanstackQuery,
      'unused-imports': unusedImports,
      promise,
      'react-native-a11y': reactNativeA11y,
    },
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
        ...globals['react-native'],
      },
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        node: {
          paths: [path.resolve(__dirname, 'src')],
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      // General
      semi: ['error', 'never'],
      'no-extra-boolean-cast': 'off',
      'no-unused-vars': 'off',
      'unused-imports/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',

      // TypeScript
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',

      // React
      'react/display-name': 'off',
      'react/prop-types': 'off',
      'react/jsx-boolean-value': ['warn', 'never'],
      'react/jsx-no-leaked-render': ['warn', { validStrategies: ['ternary', 'coerce'] }],
      'react/jsx-uses-vars': 'error',
      'react/jsx-no-undef': 'error',
      'react/jsx-key': 'error',
      'react/no-deprecated': 'error',
      'react/no-direct-mutation-state': 'warn',

      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // React Native
      'react-native/no-unused-styles': 'warn',
      'react-native/no-inline-styles': 'warn',
      'react-native/no-color-literals': 'warn',
      'react-native/split-platform-components': 'warn',

      // React Native A11y
      'react-native-a11y/has-accessibility-hint': 'warn',
      'react-native-a11y/has-valid-accessibility-actions': 'warn',
      'react-native-a11y/has-valid-accessibility-component-type': 'warn',
      'react-native-a11y/has-valid-accessibility-role': 'warn',
      'react-native-a11y/has-valid-accessibility-state': 'warn',
      'react-native-a11y/has-valid-accessibility-states': 'warn',
      'react-native-a11y/has-valid-accessibility-traits': 'warn',
      'react-native-a11y/has-valid-accessibility-value': 'warn',
      'react-native-a11y/has-valid-accessibility-descriptors': 'warn',
      'react-native-a11y/no-nested-touchables': 'warn',
      'react-native-a11y/has-valid-accessibility-ignores-invert-colors': 'warn',
      'react-native-a11y/has-valid-accessibility-live-region': 'warn',
      // 'react-native-a11y/has-valid-accessibility-view-is-modal': 'warn',
      'react-native-a11y/has-valid-important-for-accessibility': 'warn',

      // TanStack Query
      '@tanstack/query/exhaustive-deps': 'warn',
      '@tanstack/query/no-rest-destructuring': 'warn',
      '@tanstack/query/stable-query-client': 'error',

      // Promise
      'promise/no-return-wrap': 'error',
      'promise/param-names': 'error',
      'promise/catch-or-return': 'warn',
      'promise/always-return': 'warn',
      'promise/no-nesting': 'warn',

      // Imports
      'sort-imports': [
        'error',
        {
          ignoreDeclarationSort: true,
          ignoreCase: true,
        },
      ],
      'import/order': [
        'error',
        {
          groups: [['external', 'builtin'], 'internal', ['sibling', 'parent'], 'index'],
          pathGroups: [
            {
              pattern: 'react',
              group: 'external',
              position: 'before',
            },
            {
              pattern: 'react-native',
              group: 'builtin',
              position: 'after',
            },
            {
              pattern: '@app/**',
              group: 'internal',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
  prettier,
  reactYouMightNotNeedAnEffect.configs.recommended,
];
