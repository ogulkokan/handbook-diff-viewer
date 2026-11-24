<script setup lang="ts">
import { computed } from 'vue'

import { useNodeNames } from '@/composables/comparisonContext'
import type { Change, Comparison } from '@/domain/diff'
import { describeChange } from '@/domain/view'
import ChangeBadge, { type BadgeKind } from './ChangeBadge.vue'

const { changes, comparison } = defineProps<{
  /** In document order. */
  changes: readonly Change[]
  comparison: Comparison
}>()

const { nameInBase } = useNodeNames()

const entries = computed(() =>
  changes.map((change) => {
    const { name, context } = describeChange(comparison, change)
    const kind: BadgeKind =
      change.kind === 'edited' && change.formatting ? 'formatting' : change.kind
    const detail = change.kind === 'moved' ? `from ${nameInBase(change.fromParentId)}` : ''
    return {
      key: `${change.kind}-${change.nodeId}`,
      href: `#${change.nodeId}`,
      kind,
      detail,
      name,
      context,
    }
  }),
)
</script>

<template>
  <p v-if="entries.length === 0" class="empty">These two versions have no changes.</p>
  <ol v-else class="changes">
    <li v-for="entry in entries" :key="entry.key">
      <a class="changes__link" :href="entry.href">
        <ChangeBadge :kind="entry.kind" :detail="entry.detail" />
        <span class="changes__name">{{ entry.name }}</span>
        <span v-if="entry.context" class="changes__context">in {{ entry.context }}</span>
      </a>
    </li>
  </ol>
</template>

<style scoped>
.changes {
  list-style: none;
  margin: 0;
  padding: 0;
}

.changes__link {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  color: var(--text);
  text-decoration: none;
  border-radius: var(--radius);
}

.changes__link:hover {
  background: var(--surface);
}

.changes__name {
  font-weight: 600;
  overflow-wrap: anywhere;
}

.changes__context {
  color: var(--muted);
}

.empty {
  margin: 0;
  padding: var(--space-1) var(--space-2);
  color: var(--muted);
}
</style>
