import { isValidElement, type ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Can } from './Can'

let allowed = false

function expectElement(value: unknown): asserts value is ReactElement<any, any> {
  if (!isValidElement(value)) {
    throw new Error('Expected a valid React element')
  }
}

vi.mock('./usePermission', () => ({
  usePermission: () => ({
    canAny: () => allowed,
    canAll: () => allowed
  })
}))

describe('Can', () => {
  it('renders children when permission is granted', () => {
    allowed = true

    const child = <button type="button">Save</button>
    const result = Can({
      permission: 'user.write',
      children: child
    })

    expectElement(result)
    expect(result).toMatchObject({ props: { children: child } })
  })

  it('renders fallback when permission is denied', () => {
    allowed = false

    const result = Can({
      permission: 'user.write',
      fallback: <span>Denied</span>,
      children: <button type="button">Save</button>
    })

    expectElement(result)
    expectElement(result.props.children)
    expect(result.props.children).toMatchObject({
      type: 'span',
      props: { children: 'Denied' }
    })
  })

  it('disables the child element when mode is disabled', () => {
    allowed = false

    const result = Can({
      permission: 'user.write',
      mode: 'disabled',
      children: <button type="button">Save</button>
    })

    expectElement(result)
    expectElement(result.props.children)
    expect(result.props.children).toMatchObject({
      props: {
        disabled: true,
        'aria-disabled': true
      }
    })
  })
})
