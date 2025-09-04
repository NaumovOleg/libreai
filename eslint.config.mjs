import { FlatCompat } from '@eslint/eslintrc';
import pluginJs from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-plugin-prettier';
import sort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import path from 'path';
import tseslint from 'typescript-eslint';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const baseDirectory = path.dirname(filename);

const compat = new FlatCompat({ baseDirectory });

export default [
  ...compat.extends('plugin:@typescript-eslint/recommended'),
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      '.config/*',
      './eslint.config.mjs',
      './tsconfig.json',
      './dist',
      './lambdas',
      './cdk.out',
      './node_modules',
    ],
    files: ['**/*.{js,mjs,cjs,ts}'],
    plugins: {
      '@typescript-eslint': typescriptEslint,
      prettier,
      'unused-imports': unusedImports,
      import: importPlugin,
      'simple-import-sort': sort,
    },
    languageOptions: { sourceType: 'module', parser },
    rules: {
      'max-len': ['error', { code: 100 }],
      ...typescriptEslint.configs.rules,
      'prettier/prettier': 'error',
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'no-duplicate-imports': 'error',
      'unused-imports/no-unused-imports': 'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import/first': 'error',
      'import/no-duplicates': 'error',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': [
        'error',
        {
          ignoreRestArgs: true,
        },
      ],
      'lines-between-class-members': [
        'error',
        {
          enforce: [
            { blankLine: 'never', prev: '*', next: 'field' },
            { blankLine: 'never', prev: 'field', next: '*' },
            { blankLine: 'always', prev: '*', next: 'method' },
          ],
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '_[a-z-A-Z]',
          caughtErrorsIgnorePattern: '_[a-z-A-Z]',
          destructuredArrayIgnorePattern: '_[a-z-A-Z]',
          varsIgnorePattern: '_[a-z-A-Z]',
          // ignoreRestSiblings: true,
        },
      ],
    },
  },
];
