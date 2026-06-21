// packages/vite-plugin/src/rewrite.ts
import fs from 'node:fs/promises'
import path from 'node:path'
import fg from 'fast-glob'
import { normalizePath } from 'vite'
import type { NormalizedPermissionPluginOptions } from './options'
import { transformReactPermission } from './transformReact'

type LoggerLike = {
  warn(message: string): void
}

export type RewriteResult = {
  checked: number
  changed: number
  files: string[]
}

export async function rewriteSourceFiles(
  root: string,
  options: NormalizedPermissionPluginOptions,
  context: LoggerLike
): Promise<RewriteResult> {
  const include = toArray(options.rewrite.include ?? ['src/**/*.{tsx,jsx}'])

  const exclude = toArray(
    options.rewrite.exclude ?? [
      '**/node_modules/**',
      '**/dist/**',
      '**/.vite/**',
      '**/.turbo/**',
      '**/*.test.*',
      '**/*.spec.*',
      '**/*.stories.*'
    ]
  )

  const files = await fg(include, {
    cwd: root,
    absolute: true,
    onlyFiles: true,
    ignore: exclude
  })

  let changed = 0
  const changedFiles: string[] = []

  for (const file of files) {
    const id = normalizePath(file)
    const code = await fs.readFile(file, 'utf-8')

    if (options.framework !== 'react') {
      continue
    }

    const result = transformReactPermission(code, id, options)

    if (!result || result.code === code) {
      continue
    }

    changed++
    changedFiles.push(path.relative(root, file))

    if (options.rewrite.write) {
      await fs.writeFile(file, result.code, 'utf-8')
    }
  }

  const mode = options.rewrite.write ? 'write' : 'dry-run'

  if (changedFiles.length > 0) {
    context.warn(
      [
        `[vite-plugin-permission] rewrite ${mode}: ${changed} file(s) would change`,
        ...changedFiles.map((file) => `  - ${file}`)
      ].join('\n')
    )
  } else {
    context.warn(`[vite-plugin-permission] rewrite ${mode}: no files changed`)
  }

  return {
    checked: files.length,
    changed,
    files: changedFiles
  }
}

function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}
