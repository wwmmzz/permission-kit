// src/manifest.ts
import type { PermissionState } from './state'

export function createManifestJson(state: PermissionState) {
  return JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      permissions: state.toManifest()
    },
    null,
    2
  )
}
