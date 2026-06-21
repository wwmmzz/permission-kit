// src/state.ts
export type PermissionUsage = {
  permission: string
  file: string
  line?: number
  column?: number
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

  toManifest() {
    const result: Record<
      string,
      Array<{
        file: string
        line?: number
        column?: number
      }>
    > = {}

    for (const usage of this.getAllUsages()) {
      const items = (result[usage.permission] ??= [])
      const entry: {
        file: string
        line?: number
        column?: number
      } = {
        file: usage.file
      }

      if (usage.line !== undefined) {
        entry.line = usage.line
      }

      if (usage.column !== undefined) {
        entry.column = usage.column
      }

      items.push(entry)
    }

    return result
  }
}
