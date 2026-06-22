import type { Directive, DirectiveBinding, VNode } from 'vue'
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
}

export type PermissionDirectiveValue = PermissionInput

export const permissionDirective: Directive<PermissionElement, PermissionDirectiveValue> = {
  mounted(el, binding, vnode) {
    rememberInitialState(el)
    applyPermission(el, binding, vnode)
  },

  updated(el, binding, vnode) {
    applyPermission(el, binding, vnode)
  },

  beforeUnmount(el) {
    restoreElement(el)
    delete el.__permissionOriginalDisplay
    delete el.__permissionOriginalDisabled
  }
}

function applyPermission(
  el: PermissionElement,
  binding: DirectiveBinding<PermissionDirectiveValue>,
  vnode: VNode
) {
  const context = getPermissionContext(vnode)

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

function getPermissionContext(vnode: VNode): PermissionContext | undefined {
  return vnode.appContext.provides[PermissionContextKey as symbol] as PermissionContext | undefined
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
    el.__permissionOriginalDisabled = isDisableableElement(el) ? el.disabled : false
  }
}

function hideElement(el: PermissionElement) {
  el.style.display = 'none'
}

function disableElement(el: PermissionElement) {
  el.style.display = el.__permissionOriginalDisplay ?? ''
  el.setAttribute('aria-disabled', 'true')

  if (isDisableableElement(el)) {
    el.disabled = true
  }
}

function restoreElement(el: PermissionElement) {
  el.style.display = el.__permissionOriginalDisplay ?? ''
  el.removeAttribute('aria-disabled')

  if (isDisableableElement(el)) {
    el.disabled = el.__permissionOriginalDisabled ?? false
  }
}

function isDisableableElement(
  el: HTMLElement
): el is HTMLButtonElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
  return 'disabled' in el
}
