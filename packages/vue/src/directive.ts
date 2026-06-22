import {
  effectScope,
  watch,
  type Directive,
  type DirectiveBinding,
  type EffectScope,
  type VNode
} from 'vue'
import {
  PermissionContextKey,
  normalizePermissionInput,
  type PermissionContext,
  type PermissionInput
} from './provider'
import type { PermissionMode, PermissionStrategy } from './Can'

type PermissionElement = HTMLElement & {
  __permissionOriginalDisplay?: string
  __permissionOriginalDisabled?: boolean
  __permissionStopEffect?: () => void
  __permissionBindingState?: PermissionDirectiveBindingState
  __permissionVNode?: VNode
}

type PermissionDirectiveBindingState = {
  value: PermissionDirectiveValue
  arg?: DirectiveBinding<PermissionDirectiveValue>['arg']
  modifiers: DirectiveBinding<PermissionDirectiveValue>['modifiers']
  instance: DirectiveBinding<PermissionDirectiveValue>['instance']
}

type DisableableElement =
  | HTMLButtonElement
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement

export type PermissionDirectiveValue = PermissionInput

export const permissionDirective: Directive<PermissionElement, PermissionDirectiveValue> = {
  mounted(el, binding, vnode) {
    rememberInitialState(el)
    updateDirectiveState(el, binding, vnode)
    ensureReactivePermission(el)
  },

  updated(el, binding, vnode) {
    updateDirectiveState(el, binding, vnode)
    applyPermission(el)
    ensureReactivePermission(el)
  },

  beforeUnmount(el) {
    el.__permissionStopEffect?.()
    restoreElement(el)
    delete el.__permissionOriginalDisplay
    delete el.__permissionOriginalDisabled
    delete el.__permissionStopEffect
  }
}

function applyPermission(el: PermissionElement) {
  const bindingState = el.__permissionBindingState
  const vnode = el.__permissionVNode

  if (!bindingState || !vnode) {
    return
  }

  const context = getPermissionContext(vnode, bindingState)

  if (!context) {
    return
  }

  const permissions = normalizePermissionInput(bindingState.value)
  const strategy = getStrategy(bindingState)
  const mode = getMode(bindingState)

  const allowed = strategy === 'any' ? context.canAny(permissions) : context.canAll(permissions)

  if (allowed) {
    restoreElement(el)
    return
  }

  if (mode === 'disabled') {
    disableElement(el)
    return
  }

  hideElement(el)
}

function updateDirectiveState(
  el: PermissionElement,
  binding: DirectiveBinding<PermissionDirectiveValue>,
  vnode: VNode
) {
  el.__permissionBindingState = {
    value: binding.value,
    arg: binding.arg,
    modifiers: binding.modifiers,
    instance: binding.instance
  }
  el.__permissionVNode = vnode
}

function ensureReactivePermission(el: PermissionElement) {
  if (el.__permissionStopEffect) {
    return
  }

  const bindingState = el.__permissionBindingState
  const vnode = el.__permissionVNode

  if (!bindingState || !vnode) {
    return
  }

  const context = getPermissionContext(vnode, bindingState)

  if (!context) {
    return
  }

  el.__permissionStopEffect = observePermissionContext(context, () => {
    applyPermission(el)
  })
}

type PermissionContextObserver = {
  scope: EffectScope
  subscribers: Set<() => void>
}

const permissionContextObservers = new WeakMap<PermissionContext, PermissionContextObserver>()

function observePermissionContext(context: PermissionContext, subscriber: () => void) {
  let observer = permissionContextObservers.get(context)

  if (!observer) {
    const subscribers = new Set<() => void>()
    const scope = effectScope(true)

    scope.run(() => {
      watch(
        () => context.permissions.value,
        () => {
          subscribers.forEach((run) => run())
        },
        { deep: true }
      )
    })

    observer = {
      scope,
      subscribers
    }

    permissionContextObservers.set(context, observer)
  }

  observer.subscribers.add(subscriber)
  subscriber()

  return () => {
    const current = permissionContextObservers.get(context)

    if (!current) {
      return
    }

    current.subscribers.delete(subscriber)

    if (current.subscribers.size === 0) {
      current.scope.stop()
      permissionContextObservers.delete(context)
    }
  }
}

function getPermissionContext(
  vnode: VNode,
  binding: Pick<DirectiveBinding<PermissionDirectiveValue>, 'arg' | 'modifiers'> & {
    instance?: DirectiveBinding<PermissionDirectiveValue>['instance']
  }
): PermissionContext | undefined {
  const appContext = vnode.appContext ?? binding.instance?.$?.appContext

  if (!appContext) {
    return undefined
  }

  return appContext.provides[PermissionContextKey as symbol] as PermissionContext | undefined
}

function getStrategy(
  binding: Pick<DirectiveBinding<PermissionDirectiveValue>, 'arg' | 'modifiers'>
): PermissionStrategy {
  if (binding.arg === 'any' || binding.modifiers.any) {
    return 'any'
  }

  return 'all'
}

function getMode(
  binding: Pick<DirectiveBinding<PermissionDirectiveValue>, 'arg' | 'modifiers'>
): PermissionMode {
  if (binding.arg === 'disabled' || binding.modifiers.disabled) {
    return 'disabled'
  }

  return 'hidden'
}

function rememberInitialState(el: PermissionElement) {
  if (el.__permissionOriginalDisplay === undefined) {
    el.__permissionOriginalDisplay = el.style.display
  }

  if (el.__permissionOriginalDisabled === undefined) {
    el.__permissionOriginalDisabled = isDisableableElement(el)
      ? (el as DisableableElement).disabled
      : false
  }
}

function hideElement(el: PermissionElement) {
  el.style.display = 'none'
}

function disableElement(el: PermissionElement) {
  const disableable = el as PermissionElement & DisableableElement

  disableable.style.display = disableable.__permissionOriginalDisplay ?? ''
  disableable.setAttribute('aria-disabled', 'true')

  if (isDisableableElement(el)) {
    disableable.disabled = true
  }
}

function restoreElement(el: PermissionElement) {
  const disableable = el as PermissionElement & DisableableElement

  disableable.style.display = disableable.__permissionOriginalDisplay ?? ''
  disableable.removeAttribute('aria-disabled')

  if (isDisableableElement(el)) {
    disableable.disabled = disableable.__permissionOriginalDisabled ?? false
  }
}

function isDisableableElement(
  el: HTMLElement
): el is HTMLButtonElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
  return 'disabled' in el
}
