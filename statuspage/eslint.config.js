import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import prettier from 'eslint-config-prettier'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

export default [
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      '*.min.js',
      '*.min.css',
      'graphql.schema.json',
      'src/gql/',
      '*.tsbuildinfo',
      '.env*',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,ts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        process: 'readonly',
        window: 'readonly',
        console: 'readonly',
        document: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        XMLSerializer: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      vue: vue,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      'vue/multi-word-component-names': 'off',

      'no-unused-vars': 'off', // Turn off base rule as it conflicts with TypeScript rule
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    },
  },
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: typescriptParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
  prettier,
]
