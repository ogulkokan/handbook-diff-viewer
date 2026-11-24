import {
  computed,
  inject,
  provide,
  toValue,
  type ComputedRef,
  type InjectionKey,
  type Ref,
} from 'vue'

import type { Comparison } from '@/domain/diff'
import { nameOf } from '@/domain/view'

/** What the node components below App need to know about the view, beyond their own node. */
export interface ViewContext {
  comparison: ComputedRef<Comparison | null>
  /** For each node that holds a change itself or below it: the number of those changes. */
  counts: ComputedRef<ReadonlyMap<string, number>>
  /** True when runs of unchanged nodes show as folds (D10). */
  changesOnly: Ref<boolean>
  /** The id of the node that the reader is at, or null. */
  selectedId: Readonly<Ref<string | null>>
  /** The keys of the folds that are open. */
  openFolds: Readonly<Ref<ReadonlySet<string>>>
  setFoldOpen: (key: string, isOpen: boolean) => void
}

const KEY: InjectionKey<ViewContext> = Symbol('view')

export function provideViewContext(context: ViewContext): void {
  provide(KEY, context)
}

export function useViewContext(): ViewContext {
  const context = inject(KEY)
  if (!context) throw new Error('No view context. App provides it.')
  return context
}

/** True when the node with this id is the change that the reader is at. */
export function useIsSelected(id: () => string): ComputedRef<boolean> {
  const { selectedId } = useViewContext()
  return computed(() => selectedId.value === toValue(id))
}

/** Looks a node up in the two versions of the comparison in view. */
export function useNodeNames() {
  const { comparison } = useViewContext()

  /** The name of a node in the base version, for example the section that a clause moved from. */
  function nameInBase(id: string | null): string {
    const entry = id === null ? undefined : comparison.value?.baseIndex.byId.get(id)
    return entry ? nameOf(entry.node) : 'the top of the document'
  }

  function nameInTarget(id: string | null): string {
    const entry = id === null ? undefined : comparison.value?.targetIndex.byId.get(id)
    return entry ? nameOf(entry.node) : 'the top of the document'
  }

  return { nameInBase, nameInTarget }
}
