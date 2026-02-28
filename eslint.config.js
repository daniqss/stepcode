import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  js.configs.recommended, // Configuración recomendada de JS
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error', // Muestra errores de Prettier como si fueran de ESLint
    },
  },
  prettier, // Esto desactiva las reglas de ESLint que choquen con Prettier
  {
    ignores: ['node_modules/', 'dist/', 'build/'], // Aquí va lo que antes iba en .eslintignore
  },
];
