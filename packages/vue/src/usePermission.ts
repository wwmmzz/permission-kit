import { inject } from 'vue'
import { PermissionContextKey, type PermissionContext } from './provider'

export function usePermission(): PermissionContext {
  const context = inject(PermissionContextKey)

  if (!context) {
    throw new Error(
      'usePermission must be used after createPermissionPlugin() is installed or providePermission() is called.'
    )
  }

  return context
}
