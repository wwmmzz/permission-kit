import type { Plugin } from 'vite'

export type PermissionTransformOptions = {
  enabled?: boolean
  attributes?: string[]
  modeAttribute?: string
}

export type PermissionValidationOptions = {
  enabled?: boolean
  permissions?: readonly string[]
  unknownPermission?: 'warn' | 'error' | 'ignore'
}

export type PermissionKitOptions = {
  framework: 'react'
  componentName?: string
  importFrom?: string
  transform?: PermissionTransformOptions
  validate?: PermissionValidationOptions
}

export default function permissionKit(options: PermissionKitOptions): Plugin {
  const transformOptions = {
    enabled: true,
    attributes: ['permission'],
    modeAttribute: 'permissionMode',
    ...options.transform
  }
  const validationOptions = {
    enabled: false,
    permissions: [],
    unknownPermission: 'ignore' as const,
    ...options.validate
  }
  const knownPermissions = new Set(validationOptions.permissions ?? [])
  const permissionPattern = /\bpermission\s*=\s*(?:"([^"]+)"|'([^']+)'|\{`([^`]+)`\}|\{['"]([^'"]+)['"]\})/g

  return {
    name: 'permission-kit:vite-plugin',
    enforce: 'pre',
    transform(code, id) {
      const isSourceFile = /\.(tsx?|jsx?)$/.test(id)

      if (!isSourceFile) {
        return null
      }

      if (transformOptions.enabled || validationOptions.enabled) {
        permissionPattern.lastIndex = 0
        let match: RegExpExecArray | null

        while ((match = permissionPattern.exec(code))) {
          const permission = match[1] ?? match[2] ?? match[3] ?? match[4]

          if (
            validationOptions.enabled &&
            permission &&
            knownPermissions.size > 0 &&
            !knownPermissions.has(permission)
          ) {
            const message = `Unknown permission "${permission}" in ${id}`

            if (validationOptions.unknownPermission === 'error') {
              this.error(message)
            } else if (validationOptions.unknownPermission === 'warn') {
              this.warn(message)
            }
          }
        }
      }

      return null
    }
  }
}
