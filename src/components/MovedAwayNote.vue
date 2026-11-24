<script setup lang="ts">
import { useNodeNames } from '@/composables/comparisonContext'
import type { MovedAwayMarker } from '@/domain/diff'
import { nameOf } from '@/domain/view'

defineProps<{ marker: MovedAwayMarker }>()

const { nameInTarget } = useNodeNames()
</script>

<template>
  <!-- Stands where a node was before it moved to another parent (D3). -->
  <p class="note">
    <span aria-hidden="true">→</span>
    <a :href="`#${marker.node.id}`">{{ nameOf(marker.node) }}</a>
    is now in {{ nameInTarget(marker.toParentId) }}.
  </p>
</template>

<style scoped>
.note {
  margin: 0;
  padding: var(--space-2);
  border-block-start: 1px solid var(--border);
  border-inline-start: var(--edge-change) solid var(--moved-text);
  background: var(--moved-bg);
  color: var(--moved-text);
  font-size: var(--text-sm);
}

.note a {
  color: inherit;
  font-weight: 600;
}
</style>
