<script setup lang="ts">
import { computed } from 'vue'

import { useNodeNames } from '@/composables/comparisonContext'
import type { Change } from '@/domain/diff'
import ChangeBadge, { type BadgeKind } from './ChangeBadge.vue'

const { changes } = defineProps<{ changes: readonly Change[] }>()

const { nameInBase } = useNodeNames()

const badges = computed<Array<{ kind: BadgeKind; detail: string }>>(() =>
  changes.map((change) => {
    if (change.kind === 'moved') {
      return { kind: 'moved', detail: `from ${nameInBase(change.fromParentId)}` }
    }
    if (change.kind === 'edited') {
      return { kind: change.formatting ? 'formatting' : 'edited', detail: '' }
    }
    return { kind: change.kind, detail: '' }
  }),
)
</script>

<template>
  <span v-if="badges.length > 0" class="badges">
    <ChangeBadge
      v-for="badge in badges"
      :key="badge.kind"
      :kind="badge.kind"
      :detail="badge.detail"
    />
  </span>
</template>

<style scoped>
.badges {
  display: inline-flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin-inline-start: var(--space-2);
  /* A badge names the change. It is not part of the text, so it has no line through it. */
  text-decoration: none;
}
</style>
