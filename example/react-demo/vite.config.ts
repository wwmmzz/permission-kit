import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import permission from '../../packages/vite-plugin/src'

export default defineConfig({
  plugins: [
    permission({
      framework: 'react',
      componentName: 'Can',
      importFrom: '@permission-kit/react',
      transform: {
        enabled: true,
        attributes: ['permission'],
        modeAttribute: 'permissionMode'
      },
      validate: {
        enabled: true,
        permissions: [
          'user.view',
          'user.create',
          'user.update',
          'user.delete'
        ],
        unknownPermission: 'warn'
      }
    }),
    react()
  ]
})