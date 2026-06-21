// src/validate.ts
import type { NormalizedPermissionPluginOptions } from './options'
import type { PermissionUsage } from './state'

type ValidationReporter = {
  warn(message: string): void
}

export function validatePermissionUsages(
  usages: PermissionUsage[],
  options: NormalizedPermissionPluginOptions['validate'],
  reporter?: ValidationReporter
) {
  if (!options.enabled || options.unknownPermission === 'off') {
    return []
  }

  const knownSet = new Set(options.permissions)
  const grouped = new Map<string, PermissionUsage[]>()

  for (const usage of usages) {
    if (knownSet.has(usage.permission)) {
      continue
    }

    const items = grouped.get(usage.permission) ?? []
    items.push(usage)
    grouped.set(usage.permission, items)
  }

  const unknownPermissions = [...grouped.keys()].sort((left, right) => left.localeCompare(right))

  if (unknownPermissions.length === 0) {
    return []
  }

  const message = buildMessage(unknownPermissions, grouped)

  if (options.unknownPermission === 'error') {
    throw new Error(message)
  }

  reporter?.warn(message)

  return unknownPermissions
}

function buildMessage(permissions: string[], grouped: Map<string, PermissionUsage[]>) {
  const lines = [`[vite-plugin-permission] Unknown permissions: ${permissions.join(', ')}`]

  for (const permission of permissions) {
    const usages = grouped.get(permission) ?? []
    for (const usage of usages.slice(0, 3)) {
      lines.push(`  - ${formatUsage(usage)}`)
    }
  }

  return lines.join('\n')
}

function formatUsage(usage: PermissionUsage) {
  const location = [usage.file, usage.line, usage.column]
    .filter((item) => item !== undefined)
    .join(':')

  if (!usage.component) {
    return `${usage.permission} (${location})`
  }

  return `${usage.permission} (${location}, component=${usage.component})`
}
