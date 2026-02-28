import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',

      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      'no-prototype-builtins': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  prettier,
  {
    ignores: ['node_modules/', 'dist/', 'build/'],
  },
];
