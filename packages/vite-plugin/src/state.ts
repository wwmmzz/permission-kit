// src/state.ts
export type PermissionUsage = {
  permission: string
  file: string
  line?: number
  column?: number
  component?: string
}

export type PermissionManifestUsage = {
  file: string
  line?: number
  column?: number
  component?: string
}

export type PermissionManifestEntry = {
  permission: string
  count: number
  files: string[]
  usages: PermissionManifestUsage[]
}

export type PermissionManifestSummary = {
  permissions: number
  usages: number
  files: number
}

export type PermissionManifest = {
  generatedAt: string
  summary: PermissionManifestSummary
  permissions: PermissionManifestEntry[]
}

export class PermissionState {
  private fileUsageMap = new Map<string, PermissionUsage[]>()

  clear() {
    this.fileUsageMap.clear()
  }

  setFileUsage(file: string, usages: PermissionUsage[]) {
    this.fileUsageMap.set(file, usages)
  }

  removeFile(file: string) {
    this.fileUsageMap.delete(file)
  }

  getAllUsages() {
    return [...this.fileUsageMap.values()].flat()
  }

  getUsedPermissions() {
    return [...new Set(this.getAllUsages().map((item) => item.permission))].sort()
  }

  getSummary(): PermissionManifestSummary {
    const usages = this.getAllUsages()

    return {
      permissions: new Set(usages.map((item) => item.permission)).size,
      usages: usages.length,
      files: new Set(usages.map((item) => item.file)).size
    }
  }

  toManifest() {
    const grouped = new Map<string, PermissionUsage[]>()

    for (const usage of this.getAllUsages()) {
      const items = grouped.get(usage.permission) ?? []
      items.push(usage)
      grouped.set(usage.permission, items)
    }

    return [...grouped.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([permission, usages]) => {
        const sortedUsages = [...usages].sort((left, right) => compareUsage(left, right))
        const files = [...new Set(sortedUsages.map((item) => item.file))].sort((left, right) =>
          left.localeCompare(right)
        )

        return {
          permission,
          count: sortedUsages.length,
          files,
          usages: sortedUsages.map(({ file, line, column, component }) => {
            const entry: PermissionManifestUsage = { file }

            if (line !== undefined) {
              entry.line = line
            }

            if (column !== undefined) {
              entry.column = column
            }

            if (component !== undefined) {
              entry.component = component
            }

            return entry
          })
        } satisfies PermissionManifestEntry
      })
  }
}

function compareUsage(left: PermissionUsage, right: PermissionUsage) {
  const fileCompare = left.file.localeCompare(right.file)
  if (fileCompare !== 0) {
    return fileCompare
  }

  const lineCompare = (left.line ?? 0) - (right.line ?? 0)
  if (lineCompare !== 0) {
    return lineCompare
  }

  const columnCompare = (left.column ?? 0) - (right.column ?? 0)
  if (columnCompare !== 0) {
    return columnCompare
  }

  return (left.component ?? '').localeCompare(right.component ?? '')
}
