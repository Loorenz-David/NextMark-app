import js from '@eslint/js'
import globals from 'globals'
import importPlugin from 'eslint-plugin-import'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}', '../packages/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: ['./tsconfig.app.json'],
        },
      },
    },
    rules: {
      'import/no-cycle': 'error',
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@shared-utils/*', '@shared-domain/*', '@packages/*'],
            message: 'Import shared packages from their root barrel only.',
          },
        ],
      }],
    },
  },
  {
    files: ['../packages/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        paths: [
          {
            name: 'react',
            message: 'Shared packages must remain framework-agnostic.',
          },
          {
            name: 'zustand',
            message: 'Shared packages must remain framework-agnostic.',
          },
        ],
        patterns: [
          {
            group: ['react/*', 'zustand/*', '@tanstack/*'],
            message: 'Shared packages must remain framework-agnostic.',
          },
          {
            group: ['@/*', '@app', '@app/*', '@features', '@features/*'],
            message: 'Shared packages cannot import admin-app code.',
          },
          {
            group: ['../admin-app/*', '../../admin-app/*', '../../../admin-app/*'],
            message: 'Shared packages cannot import app code via relative paths.',
          },
        ],
      }],
    },
  },
])
