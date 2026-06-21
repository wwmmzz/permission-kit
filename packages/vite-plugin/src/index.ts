// src/index.ts
import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite'
import { createFilter } from 'vite'
import path from 'node:path'
import fs from 'node:fs/promises'
import { resolveOptions, type PermissionPluginOptions } from './options'
import { PermissionState } from './state'
import { transformReactPermission } from './transformReact'
import { createManifestJson } from './manifest'
import { createDts } from './dts'
import { createRootFilter } from './filter'
import { rewriteSourceFiles } from './rewrite'

const VIRTUAL_ID = 'virtual:permission-manifest'
const RESOLVED_VIRTUAL_ID = '\0' + VIRTUAL_ID

export default function permissionPlugin(userOptions: PermissionPluginOptions = {}): Plugin {
  const options = resolveOptions(userOptions)

  let config: ResolvedConfig
  let server: ViteDevServer | undefined
  let rewriteExecuted = false
  let transformContext: { warn: (message: string) => void } | undefined
  const state = new PermissionState()

  const filter = createFilter(
    options.include ?? [/\.tsx$/, /\.jsx$/, /\.vue$/],
    options.exclude ?? [/node_modules/, /\.git/]
  )
  return {
    name: 'vite-plugin-permission',
    enforce: 'pre',

    configResolved(resolvedConfig) {
      config = resolvedConfig

      createRootFilter(
        config.root,
        options.transform.include ?? options.include ?? ['src/**/*.{tsx,jsx}'],
        options.transform.exclude ??
          options.exclude ?? [
            '**/node_modules/**',
            '**/dist/**',
            '**/.vite/**',
            '**/.turbo/**',
            '**/*.test.*',
            '**/*.spec.*',
            '**/*.stories.*'
          ]
      )
    },

    async buildStart() {
      state.clear?.()
      if (!options.rewrite.enabled) {
        return
      }

      if (options.rewrite.once && rewriteExecuted) {
        return
      }

      rewriteExecuted = true

      await rewriteSourceFiles(config.root, options, this)
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) {
        return RESOLVED_VIRTUAL_ID
      }

      return null
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_ID) {
        return `export default ${JSON.stringify(state.toManifest(), null, 2)}`
      }

      return null
    },

    async transform(code, id) {
      transformContext = this

      if (!filter(id)) {
        return null
      }

      if (!options.transform.enabled) {
        return null
      }

      if (options.framework === 'react') {
        const result = transformReactPermission(code, id, options)

        if (!result) {
          state.removeFile(id)
          return null
        }

        state.setFileUsage(id, result.usages)

        validatePermissions(result.usages.map((item) => item.permission))

        return {
          code: result.code,
          map: result.map
        }
      }

      // Vue MVP 阶段建议只扫描，不强行 template 改写
      return null
    },

    async generateBundle() {
      await emitManifestAndDts(config.root, options, state)
    },

    configureServer(_server) {
      server = _server

      server.middlewares.use('/__permission/manifest', async (_req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(state.toManifest(), null, 2))
      })
    },

    async handleHotUpdate(ctx) {
      if (!filter(ctx.file)) {
        return
      }

      // 文件变化后，先删除旧记录，等待下一次 transform 写入新记录
      state.removeFile(ctx.file)

      // 通知前端或 devtools 权限 manifest 变了
      ctx.server.ws.send({
        type: 'custom',
        event: 'permission-manifest-update',
        data: state.toManifest()
      })
    }
  }

  function validatePermissions(usedPermissions: string[]) {
    if (!options.validate.enabled) {
      return
    }

    if (options.validate.unknownPermission === 'off') {
      return
    }

    const knownSet = new Set(options.validate.permissions)

    const unknown = usedPermissions.filter((item) => !knownSet.has(item))

    if (unknown.length === 0) {
      return
    }

    const message = `[vite-plugin-permission] Unknown permissions: ${unknown.join(', ')}`

    if (options.validate.unknownPermission === 'error') {
      throw new Error(message)
    }

    transformContext?.warn(message)
  }
}

async function emitManifestAndDts(
  root: string,
  options: ReturnType<typeof resolveOptions>,
  state: PermissionState
) {
  if (options.manifest.enabled) {
    const manifestPath = path.resolve(root, options.manifest.output)
    await fs.mkdir(path.dirname(manifestPath), { recursive: true })
    await fs.writeFile(manifestPath, createManifestJson(state), 'utf-8')
  }

  if (options.dts.enabled) {
    const dtsPath = path.resolve(root, options.dts.output)
    await fs.mkdir(path.dirname(dtsPath), { recursive: true })
    await fs.writeFile(
      dtsPath,
      createDts(state.getUsedPermissions(), options.dts.typeName),
      'utf-8'
    )
  }
}
