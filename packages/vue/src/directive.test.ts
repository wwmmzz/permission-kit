import { nextTick, type VNode } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { permissionDirective } from './directive'
import { PermissionContextKey, createPermissionContext } from './provider'

const directive = permissionDirective as {
  mounted: (el: HTMLButtonElement | HTMLElement, binding: any, vnode: VNode) => void
}

describe('permissionDirective', () => {
  it('reacts to permission changes through the shared context observer', async () => {
    const context = createPermissionContext(['user.view'])
    const el = {
      style: {
        display: ''
      },
      setAttribute: vi.fn(),
      removeAttribute: vi.fn(),
      disabled: false
    } as unknown as HTMLButtonElement
    const vnode = {
      appContext: {
        provides: {
          [PermissionContextKey as symbol]: context
        }
      }
    } as VNode
    const binding = {
      value: 'user.delete',
      oldValue: undefined,
      arg: 'disabled',
      modifiers: {},
      instance: {
        $: {
          appContext: vnode.appContext
        }
      }
    }

    directive.mounted(el, binding, vnode)

    expect(el.disabled).toBe(true)
    expect(el.style.display).toBe('')
    expect(el.setAttribute).toHaveBeenCalledWith('aria-disabled', 'true')

    context.setPermissions(['user.view', 'user.delete'])
    await nextTick()

    expect(el.disabled).toBe(false)
    expect(el.removeAttribute).toHaveBeenCalledWith('aria-disabled')
  })

  it('hides the element when permission is denied in hidden mode', async () => {
    const context = createPermissionContext(['user.view'])
    const el = {
      style: {
        display: ''
      },
      setAttribute: vi.fn(),
      removeAttribute: vi.fn()
    } as unknown as HTMLElement
    const vnode = {
      appContext: {
        provides: {
          [PermissionContextKey as symbol]: context
        }
      }
    } as VNode
    const binding = {
      value: 'system.admin',
      oldValue: undefined,
      arg: undefined,
      modifiers: {},
      instance: {
        $: {
          appContext: vnode.appContext
        }
      }
    }

    directive.mounted(el, binding, vnode)

    expect(el.style.display).toBe('none')

    context.setPermissions(['system.admin'])
    await nextTick()

    expect(el.style.display).toBe('')
  })
})
