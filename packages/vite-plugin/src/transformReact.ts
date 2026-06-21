// src/transformReact.ts
import { parse } from '@babel/parser'
import traverse, { type NodePath } from '@babel/traverse'
import type {
  JSXAttribute,
  JSXElement,
  JSXIdentifier,
  JSXMemberExpression,
  JSXNamespacedName
} from '@babel/types'
import MagicString from 'magic-string'
import type { NormalizedPermissionPluginOptions } from './options'
import type { PermissionUsage } from './state'

type TransformResult = {
  code: string
  map: any
  usages: PermissionUsage[]
}

type PendingWrap = {
  node: JSXElement
  permissionCode: string
  modeCode: string | undefined
  attrsToRemove: JSXAttribute[]
}

export function transformReactPermission(
  code: string,
  id: string,
  options: NormalizedPermissionPluginOptions
): TransformResult | null {
  if (!/\.[jt]sx$/.test(id)) {
    return null
  }

  const attrs = options.transform.attributes
  const modeAttrName = options.transform.modeAttribute
  const componentName = options.componentName
  debugger
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
    errorRecovery: true
  })

  const ms = new MagicString(code)
  const wraps: PendingWrap[] = []
  const usages: PermissionUsage[] = []
  const removes: JSXAttribute[] = []

  let hasCanImport = false
  let lastImportEnd = 0

  traverse(ast, {
    ImportDeclaration(path) {
      lastImportEnd = Math.max(lastImportEnd, path.node.end ?? 0)

      if (path.node.source.value === options.importFrom) {
        for (const specifier of path.node.specifiers) {
          if (specifier.type === 'ImportSpecifier' && specifier.local.name === componentName) {
            hasCanImport = true
          }
        }
      }
    },

    JSXElement(path) {
      const node = path.node

      // 避免 <Can permission="x"> 被再次包裹
      const openingName = node.openingElement.name
      if (openingName.type === 'JSXIdentifier' && openingName.name === componentName) {
        return
      }

      const attributes = node.openingElement.attributes
      const permissionAttr = attributes.find((attr): attr is JSXAttribute => {
        return (
          attr.type === 'JSXAttribute' &&
          attr.name.type === 'JSXIdentifier' &&
          attrs.includes(attr.name.name)
        )
      })

      if (!permissionAttr) {
        return
      }

      const modeAttr = attributes.find((attr): attr is JSXAttribute => {
        return (
          attr.type === 'JSXAttribute' &&
          attr.name.type === 'JSXIdentifier' &&
          attr.name.name === modeAttrName
        )
      })

      const permissionCode = getJSXAttributeValueCode(code, permissionAttr)
      if (!permissionCode) {
        return
      }

      const modeCode = modeAttr ? getJSXAttributeValueCode(code, modeAttr) : undefined

      const permissionLiteral = getStaticStringValue(permissionAttr)
      if (permissionLiteral) {
        const usage: PermissionUsage = {
          permission: permissionLiteral,
          file: id
        }

        if (permissionAttr.loc?.start.line !== undefined) {
          usage.line = permissionAttr.loc.start.line
        }

        if (permissionAttr.loc?.start.column !== undefined) {
          usage.column = permissionAttr.loc.start.column
        }

        usages.push(usage)
      }

      const attrsToRemove = modeAttr ? [permissionAttr, modeAttr] : [permissionAttr]

      // 2. 已经在 <Can> 内部：只删除 permission 属性，不再包裹
      if (isInsideCanElement(path, componentName)) {
        removes.push(...attrsToRemove)
        return
      }

      const resolvedModeCode = modeCode ?? undefined

      wraps.push({
        node,
        permissionCode,
        modeCode: resolvedModeCode,
        attrsToRemove: modeAttr ? [permissionAttr, modeAttr] : [permissionAttr]
      })

      // 4. 可选：如果当前元素已经要被包裹，可以跳过它的子节点
      // 这样可以避免父子都有 permission 时产生嵌套。
      if (!options.transform.allowNested) {
        path.skip()
      }
    }
  })

  if (removes.length) {
    // 先删除在 <Can> 内部的冗余 permission 属性
    removes
      .sort((a, b) => (b.start ?? 0) - (a.start ?? 0))
      .forEach((attr) => {
        removeJSXAttribute(ms, code, attr)
      })
  }

  if (wraps.length === 0) {
    return null
  }

  // 倒序修改，避免位置偏移
  wraps
    .sort((a, b) => (b.node.start ?? 0) - (a.node.start ?? 0))
    .forEach((item) => {
      for (const attr of item.attrsToRemove) {
        removeJSXAttribute(ms, code, attr)
      }

      const start = item.node.start
      const end = item.node.end

      if (start == null || end == null) {
        return
      }

      const modePart = item.modeCode ? ` mode={${item.modeCode}}` : ''

      ms.prependLeft(start, `<${componentName} permission={${item.permissionCode}}${modePart}>`)

      ms.appendRight(end, `</${componentName}>`)
    })

  if (!hasCanImport) {
    const importCode = `import { ${componentName} } from '${options.importFrom}'\n`

    if (lastImportEnd > 0) {
      ms.appendRight(lastImportEnd, `\n${importCode}`)
    } else {
      ms.prepend(importCode)
    }
  }

  return {
    code: ms.toString(),
    map: ms.generateMap({
      source: id,
      includeContent: true,
      hires: true
    }),
    usages
  }
}

function getJSXAttributeValueCode(code: string, attr: JSXAttribute): string | null {
  const value = attr.value

  if (!value) {
    return null
  }

  if (value.type === 'StringLiteral') {
    return JSON.stringify(value.value)
  }

  if (value.type === 'JSXExpressionContainer') {
    const expr = value.expression

    if (expr.type === 'JSXEmptyExpression' || expr.start == null || expr.end == null) {
      return null
    }

    return code.slice(expr.start, expr.end)
  }

  return null
}

function getStaticStringValue(attr: JSXAttribute): string | null {
  const value = attr.value

  if (!value) {
    return null
  }

  if (value.type === 'StringLiteral') {
    return value.value
  }

  if (value.type === 'JSXExpressionContainer' && value.expression.type === 'StringLiteral') {
    return value.expression.value
  }

  return null
}

function removeJSXAttribute(ms: MagicString, code: string, attr: JSXAttribute) {
  if (attr.start == null || attr.end == null) {
    return
  }

  let start = attr.start
  let end = attr.end

  // 顺手删除属性前面的空格，避免留下多余空白
  while (start > 0 && /\s/.test(code.charAt(start - 1))) {
    start--
  }

  ms.remove(start, end)
}

function getJSXName(name: JSXIdentifier | JSXMemberExpression | JSXNamespacedName): string {
  if (name.type === 'JSXIdentifier') {
    return name.name
  }

  if (name.type === 'JSXMemberExpression') {
    return `${getJSXName(name.object as any)}.${getJSXName(name.property as any)}`
  }

  return `${name.namespace.name}:${name.name.name}`
}

function isCanElement(node: JSXElement, componentName: string) {
  const name = getJSXName(node.openingElement.name)

  return name === componentName
}

function isInsideCanElement(path: NodePath<JSXElement>, componentName: string) {
  return Boolean(
    path.findParent((parentPath) => {
      if (!parentPath.isJSXElement()) {
        return false
      }

      return isCanElement(parentPath.node, componentName)
    })
  )
}
