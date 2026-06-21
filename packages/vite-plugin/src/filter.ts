// packages/vite-plugin/src/filter.ts
import path from 'node:path'
import { createFilter, normalizePath } from 'vite'

type Pattern = string | RegExp | Array<string | RegExp> | undefined

export function createRootFilter(root: string, include: Pattern, exclude: Pattern) {
  return createFilter(normalizePatterns(root, include), normalizePatterns(root, exclude))
}

function normalizePatterns(root: string, patterns: Pattern) {
  if (!patterns) {
    return undefined
  }

  const list = Array.isArray(patterns) ? patterns : [patterns]

  return list.map((item) => {
    if (item instanceof RegExp) {
      return item
    }

    // 绝对路径 glob：只做 POSIX 规范化
    if (path.isAbsolute(item)) {
      return normalizePath(item)
    }

    // 相对路径 glob：基于 Vite root 转绝对
    return normalizePath(path.resolve(root, item))
  })
}

export function cleanId(id: string) {
  return normalizePath(id.split('?')[0] ?? id)
}
