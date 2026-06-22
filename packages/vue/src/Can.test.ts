import { Fragment, h, type VNode } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { Can } from './Can'

let allowed = false

vi.mock('./usePermission', () => ({
  usePermission: () => ({
    canAny: () => allowed,
    canAll: () => allowed
  })
}))

function renderCan(props: Record<string, unknown>, slots: Record<string, () => VNode[]>) {
  const setup = (Can as any).setup
  return setup(props, { slots })()
}

describe('Can', () => {
  it('disables nested nodes inside fragments', () => {
    allowed = false

    const result = renderCan(
      {
        permission: 'user.write',
        mode: 'disabled'
      },
      {
        default: () => [h(Fragment, null, [h('button', { type: 'button' }, 'Save')])]
      }
    )

    expect(Array.isArray(result)).toBe(true)
    expect(result[0]?.type).toBe(Fragment)

    const fragmentChildren = result[0]?.children as VNode[]
    expect(fragmentChildren[0]?.props).toMatchObject({
      disabled: true,
      'aria-disabled': 'true'
    })
  })

  it('renders fallback when permission is denied', () => {
    allowed = false

    const result = renderCan(
      {
        permission: 'user.write'
      },
      {
        default: () => [h('button', { type: 'button' }, 'Save')],
        fallback: () => [h('span', null, 'Denied')]
      }
    )

    expect(result[0]?.type).toBe('span')
  })
})
