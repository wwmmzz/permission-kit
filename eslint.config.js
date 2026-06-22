import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettier from 'eslint-config-prettier/flat'

const tsFiles = ['**/*.{ts,tsx}']
const jsFiles = ['**/*.{js,cjs,mjs}']

export default [
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/.turbo/**',
      '**/src/generated/**'
    ]
  },
  {
    files: jsFiles,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    }
  },

  // 1. 通用 TypeScript 基础配置（移除了 React 相关的插件和规则）
  {
    files: tsFiles,
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-redeclare': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/consistent-type-imports': 'error'
    }
  },

  // 2. 🎯 【新增】React 专属配置块：精确制导，只管 React 包，放过 Vue 包！
  {
    // 限制仅在 packages/react 目录（以及你的 example 里的 react 示例，如果有的话）生效
    files: [
      'packages/react/**/*.{ts,tsx}',
      'example/react-demo/**/*.{ts,tsx}' // 如果有 react 示例目录可以加上，没有就删掉这行
    ],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true
        }
      ]
    }
  },

  prettier
]
