<script setup lang="ts">
import { computed } from 'vue'

import { useViewContext } from '@/composables/comparisonContext'
import type { ViewItem } from '@/domain/diff'
import { foldUnchanged, type Folded } from '@/domain/view'
import MovedAwayNote from './MovedAwayNote.vue'
import NodeClause from './NodeClause.vue'
import NodeSection from './NodeSection.vue'

const { items, level } = defineProps<{
  /** The sections and clauses of one parent, with the markers of nodes that moved away. */
  items: readonly ViewItem[]
  /** The heading level for the nodes of this list. */
  level: number
}>()

const { changesOnly, counts, openFolds, setFoldOpen } = useViewContext()

// The reader, the find-in-page of the browser and a jump can each open or close a fold.
// The toggle event reports all three.
function onToggle(key: string, event: Event): void {
  if (event.currentTarget instanceof HTMLDetailsElement) setFoldOpen(key, event.currentTarget.open)
}

const entries = computed<Folded[]>(() =>
  changesOnly.value
    ? foldUnchanged(items, counts.value)
    : items.map((item) => ({ fold: false, item })),
)
</script>

<template>
  <template
    v-for="entry in entries"
    :key="
      entry.fold
        ? entry.key
        : entry.item.kind === 'node'
          ? entry.item.node.id
          : `marker-${entry.item.node.id}`
    "
  >
    <!--
      Unchanged nodes stay in the page inside a closed <details>, so find-in-page still reaches
      them (D10). The summary is plain text, not a heading: a heading there is lost to some
      screen readers.
    -->
    <details
      v-if="entry.fold"
      class="fold"
      :open="openFolds.has(entry.key)"
      :data-fold="entry.key"
      @toggle="onToggle(entry.key, $event)"
    >
      <summary class="fold__summary">{{ entry.label }}</summary>
      <template v-for="item in entry.items" :key="item.node.id">
        <NodeSection v-if="item.node.type === 'section'" :item="item" :level="level" />
        <NodeClause v-else :item="item" :level="level" />
      </template>
    </details>
    <MovedAwayNote v-else-if="entry.item.kind === 'moved-away'" :marker="entry.item" />
    <NodeSection v-else-if="entry.item.node.type === 'section'" :item="entry.item" :level="level" />
    <NodeClause v-else :item="entry.item" :level="level" />
  </template>
</template>

<style scoped>
.fold {
  margin-block: var(--space-2);
  border: 1px dashed var(--border-control);
  border-radius: var(--radius);
}

.fold__summary {
  padding: var(--space-1) var(--space-3);
  color: var(--muted);
  font-size: var(--text-sm);
  cursor: pointer;
}

.fold__summary:hover {
  background: var(--surface);
  color: var(--text);
}

.fold[open] > .fold__summary {
  border-block-end: 1px dashed var(--border-control);
}
</style>
