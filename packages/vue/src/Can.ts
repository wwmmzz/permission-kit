import { cloneVNode, createVNode, defineComponent, Fragment, type PropType, type VNode } from 'vue'
import { normalizePermissionInput, type PermissionInput } from './provider'
import { usePermission } from './usePermission'

export type PermissionStrategy = 'any' | 'all'
export type PermissionMode = 'hidden' | 'disabled'

export const Can = defineComponent({
  name: 'Can',

  props: {
    permission: {
      type: [String, Array] as PropType<PermissionInput>,
      required: true
    },
    strategy: {
      type: String as PropType<PermissionStrategy>,
      default: 'all'
    },
    mode: {
      type: String as PropType<PermissionMode>,
      default: 'hidden'
    }
  },

  setup(props, { slots }) {
    const permissionContext = usePermission()

    return () => {
      const permissions = normalizePermissionInput(props.permission)

      const allowed =
        props.strategy === 'any'
          ? permissionContext.canAny(permissions)
          : permissionContext.canAll(permissions)

      if (allowed) {
        return slots.default?.()
      }

      if (slots.fallback) {
        return slots.fallback()
      }

      if (props.mode === 'disabled') {
        return disableVNodes(slots.default?.() ?? [])
      }

      return null
    }
  }
})

function disableVNodes(nodes: VNode[]): VNode[] {
  return nodes.map((node) => {
    if (node.type === Fragment && Array.isArray(node.children)) {
      return createVNode(Fragment, null, disableVNodes(node.children as VNode[]))
    }

    if (typeof node.type === 'string' || typeof node.type === 'object') {
      return cloneVNode(node, {
        disabled: true,
        'aria-disabled': 'true'
      })
    }

    return node
  })
}
