// src/manifest.ts
import type { PermissionManifest, PermissionState } from './state'

export function createManifest(state: PermissionState): PermissionManifest {
  return {
    generatedAt: new Date().toISOString(),
    summary: state.getSummary(),
    permissions: state.toManifest()
  }
}

export function createManifestJson(state: PermissionState) {
  return JSON.stringify(createManifest(state), null, 2)
}
