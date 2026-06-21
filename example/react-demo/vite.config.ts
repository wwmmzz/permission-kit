import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Inspect from 'vite-plugin-inspect'
import permission from '../../packages/vite-plugin/src'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@permission-kit/core': path.resolve(__dirname, '../../packages/core/src'),
      '@permission-kit/react': path.resolve(__dirname, '../../packages/react/src'),
      '@permission-kit/vite-plugin': path.resolve(__dirname, '../../packages/vite-plugin/src')
    }
  },
  plugins: [
    Inspect(),
    permission({
      framework: 'react',
      componentName: 'Can',
      importFrom: '@permission-kit/react',
      include: ['src/**/*.{ts,tsx,jsx}'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/*.test.*', '**/*.spec.*', '**/*.stories.*'],
      transform: {
        enabled: true,
        attributes: ['permission', '$permission', '__permission'],
        modeAttribute: 'permissionMode'
      },
      rewrite: {
        enabled: process.env.PERMISSION_REWRITE === '1',
        write: process.env.PERMISSION_REWRITE_WRITE === '1',
        include: ['src/**/*.{tsx,jsx}']
      },
      validate: {
        enabled: true,
        permissions: ['user.view', 'user.create', 'user.update', 'user.delete'],
        unknownPermission: 'warn'
      }
    }),
    react()
  ]
})
