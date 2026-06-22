import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@eycraf/permission-kit-core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
      '@eycraf/permission-kit-vue': path.resolve(__dirname, '../../packages/vue/src/index.ts')
    }
  },
  plugins: [vue()],
  server: {
    fs: {
      allow: [path.resolve(__dirname, '../..')]
    },
    host: '0.0.0.0',
    port: 5174
  },
  optimizeDeps: {
    exclude: ['@eycraf/permission-kit-core', '@eycraf/permission-kit-vue']
  }
})
