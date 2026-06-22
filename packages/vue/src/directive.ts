import { watchEffect, type Directive, type DirectiveBinding, type VNode } from 'vue'
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
    setupReactivePermission(el, binding, vnode)
    applyPermission(el, binding, vnode)
  },

  updated(el, binding, vnode) {
    applyPermission(el, binding, vnode)
  },

  beforeUnmount(el) {
    el.__permissionStopEffect?.()
    restoreElement(el)
    delete el.__permissionOriginalDisplay
    delete el.__permissionOriginalDisabled
    delete el.__permissionStopEffect
  }
}

function applyPermission(
  el: PermissionElement,
  binding: DirectiveBinding<PermissionDirectiveValue>,
  vnode: VNode
) {
  const context = getPermissionContext(vnode, binding)

  if (!context) {
    return
  }

  const permissions = normalizePermissionInput(binding.value)
  const strategy = getStrategy(binding)
  const mode = getMode(binding)

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

function setupReactivePermission(
  el: PermissionElement,
  binding: DirectiveBinding<PermissionDirectiveValue>,
  vnode: VNode
) {
  el.__permissionStopEffect?.()

  const context = getPermissionContext(vnode, binding)

  if (!context) {
    return
  }

  el.__permissionStopEffect = watchEffect(() => {
    const permissions = normalizePermissionInput(binding.value)
    const strategy = getStrategy(binding)
    const mode = getMode(binding)

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
  })
}

function getPermissionContext(
  vnode: VNode,
  binding: DirectiveBinding<PermissionDirectiveValue>
): PermissionContext | undefined {
  const appContext = vnode.appContext ?? binding.instance?.$?.appContext

  if (!appContext) {
    return undefined
  }

  return appContext.provides[PermissionContextKey as symbol] as PermissionContext | undefined
}

function getStrategy(binding: DirectiveBinding<PermissionDirectiveValue>): PermissionStrategy {
  if (binding.arg === 'any' || binding.modifiers.any) {
    return 'any'
  }

  return 'all'
}

function getMode(binding: DirectiveBinding<PermissionDirectiveValue>): PermissionMode {
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
