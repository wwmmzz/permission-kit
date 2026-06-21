import { describe, expect, it } from 'vitest'
import { resolveOptions } from './options'
import { transformReactPermission } from './transformReact'

const options = resolveOptions({
  importFrom: '@permission-kit/react'
})

describe('transformReactPermission', () => {
  it('wraps permissioned elements and injects the Can import', () => {
    const input = `const view = <button permission="user.create" permissionMode="disabled">Create</button>`

    const result = transformReactPermission(input, '/src/view.tsx', options)

    expect(result).not.toBeNull()
    expect(result?.code).toContain(`import { Can } from '@permission-kit/react'`)
    expect(result?.code).toContain('<Can permission={"user.create"} mode={"disabled"}>')
    expect(result?.code).toContain('<button>Create</button>')
  })

  it('removes redundant permission props inside an existing Can wrapper', () => {
    const input = `import { Can } from '@permission-kit/react'
const view = <Can><button permission="user.delete">Delete</button></Can>`

    const result = transformReactPermission(input, '/src/view.tsx', options)

    expect(result).not.toBeNull()
    expect(result?.code).not.toContain('permission="user.delete"')
    expect(result?.code).toContain('<Can><button>Delete</button></Can>')
  })

  it('keeps nested permission nodes unwrapped when nested wrapping is disabled', () => {
    const input = `const view = <section permission="section.read"><button permission="button.click">Action</button></section>`

    const result = transformReactPermission(input, '/src/view.tsx', options)

    expect(result).not.toBeNull()
    expect(result?.code).toContain('<Can permission={"section.read"}>')
    expect(result?.code).toContain('permission="button.click"')
    expect((result?.code.match(/<Can /g) ?? []).length).toBe(1)
  })
})
