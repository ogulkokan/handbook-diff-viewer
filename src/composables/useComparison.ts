import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue'

import { diffDocuments } from '@/domain/diff'
import { pairReplaced } from '@/domain/pairReplaced'
import type { HandbookDocument } from '@/domain/types'
import type { UrlState } from './urlState'
import {
  changeCounts,
  changesIn,
  isFormattingChange,
  withoutFormattingChanges,
} from '@/domain/view'

/**
 * The comparison that the reader looks at: a base version, a newer target version (D2),
 * and the choice to see formatting changes (D5).
 */
export function useComparison(
  versions: MaybeRefOrGetter<readonly HandbookDocument[]>,
  initial: UrlState,
) {
  const chosenBase = ref<number | null>(initial.base)
  const chosenTarget = ref<number | null>(initial.target)
  const showFormatting = ref(initial.showFormatting)
  const changesOnly = ref(initial.changesOnly)

  const all = computed(() => toValue(versions))

  // The oldest version has nothing older to compare with, so it is not a target.
  const targetOptions = computed(() => (all.value.length > 1 ? all.value.slice(1) : all.value))
  // Until the reader chooses: the previous version against the latest.
  const target = computed(
    () =>
      targetOptions.value.find((document) => document.version === chosenTarget.value) ??
      all.value.at(-1),
  )
  // The base version is always older than the target version.
  const baseOptions = computed(() =>
    all.value.filter((document) => target.value && document.version < target.value.version),
  )
  const base = computed(
    () =>
      baseOptions.value.find((document) => document.version === chosenBase.value) ??
      baseOptions.value.at(-1),
  )
  const comparison = computed(() =>
    target.value ? pairReplaced(diffDocuments(base.value ?? target.value, target.value)) : null,
  )
  const tree = computed(() => {
    if (!comparison.value) return []
    return showFormatting.value
      ? comparison.value.tree
      : withoutFormattingChanges(comparison.value.tree)
  })
  const changes = computed(() => changesIn(tree.value))
  const counts = computed(() => changeCounts(tree.value))
  const formattingCount = computed(
    () => comparison.value?.changes.filter(isFormattingChange).length ?? 0,
  )

  return {
    base,
    target,
    baseOptions,
    targetOptions,
    comparison,
    tree,
    changes,
    counts,
    formattingCount,
    showFormatting,
    changesOnly,
    chooseBase: (version: number) => (chosenBase.value = version),
    chooseTarget: (version: number) => (chosenTarget.value = version),
  }
}
