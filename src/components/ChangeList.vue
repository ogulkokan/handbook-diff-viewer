<script setup lang="ts">
import { computed } from 'vue'

import type { Change, Comparison } from '@/domain/diff'
import { describeChange } from '@/domain/view'
import ChangeBadge, { type BadgeKind } from './ChangeBadge.vue'

const { changes, comparison } = defineProps<{
  /** In document order. */
  changes: readonly Change[]
  comparison: Comparison
}>()

const entries = computed(() =>
  changes.map((change) => {
    const { name, path, detail } = describeChange(comparison, change)
    const kind: BadgeKind =
      change.kind === 'edited' && change.formatting ? 'formatting' : change.kind
    return {
      key: `${change.kind}-${change.nodeId}`,
      href: `#${change.nodeId}`,
      kind,
      name,
      path: path.join(' / '),
      detail,
    }
  }),
)
</script>

<template>
  <p v-if="entries.length === 0" class="empty">These two versions have no changes.</p>
  <ol v-else class="changes">
    <li v-for="entry in entries" :key="entry.key">
      <a class="changes__link" :href="entry.href">
        <span v-if="entry.path" class="changes__path">{{ entry.path }}</span>
        <span class="changes__line">
          <ChangeBadge :kind="entry.kind" />
          <span class="changes__name">{{ entry.name }}</span>
        </span>
        <span v-if="entry.detail" class="changes__detail">{{ entry.detail }}</span>
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
  flex-direction: column;
  gap: var(--space-half);
  padding: var(--space-2);
  border-block-end: 1px solid var(--border);
  color: var(--text);
  text-decoration: none;
}

.changes__link:hover {
  background: var(--surface);
}

.changes__line {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-2);
}

.changes__name {
  font-weight: 600;
  overflow-wrap: anywhere;
}

.changes__path,
.changes__detail {
  color: var(--muted);
}

.empty {
  margin: 0;
  padding: var(--space-1) var(--space-2);
  color: var(--muted);
}
</style>
