import type { PermissionInput } from '@eycraf/permission-kit-vue'

declare module 'vue-router' {
  interface RouteMeta {
    permission?: PermissionInput
  }
}

export {}
