import { inject, provide, type ComputedRef, type InjectionKey } from 'vue'

import type { Comparison } from '@/domain/diff'
import { nameOf } from '@/domain/view'

const KEY: InjectionKey<ComputedRef<Comparison | null>> = Symbol('comparison')

/** Gives the comparison to the node components below, which need names from both versions. */
export function provideComparison(comparison: ComputedRef<Comparison | null>): void {
  provide(KEY, comparison)
}

/** Looks a node up in the two versions of the comparison in view. */
export function useNodeNames() {
  const comparison = inject(KEY)

  /** The name of a node in the base version, for example the section that a clause moved from. */
  function nameInBase(id: string | null): string {
    const entry = id === null ? undefined : comparison?.value?.baseIndex.byId.get(id)
    return entry ? nameOf(entry.node) : 'the top of the document'
  }

  function nameInTarget(id: string | null): string {
    const entry = id === null ? undefined : comparison?.value?.targetIndex.byId.get(id)
    return entry ? nameOf(entry.node) : 'the top of the document'
  }

  return { nameInBase, nameInTarget }
}
