<script setup lang="ts">
import { computed } from 'vue'

import { useIsSelected } from '@/composables/comparisonContext'
import type { ViewNode } from '@/domain/diff'
import { editOf } from '@/domain/view'
import NodeBadges from './NodeBadges.vue'
import PresenceText from './PresenceText.vue'
import TextChange from './TextChange.vue'

const { item } = defineProps<{ item: ViewNode }>()

const selected = useIsSelected(() => item.node.id)

const field = computed(() => {
  if (item.node.type !== 'field') throw new Error(`NodeField got a ${item.node.type}`)
  return item.node
})
const labelEdit = computed(() => editOf(item.changes, 'label'))
const valueEdit = computed(() => editOf(item.changes, 'value'))
</script>

<template>
  <div
    :id="field.id"
    class="row"
    :class="[`row--${item.presence}`, { 'is-selected': selected }]"
    tabindex="-1"
  >
    <dt class="row__label">
      <PresenceText :presence="item.presence">
        <TextChange v-if="labelEdit" :before="labelEdit.before" :after="labelEdit.after" />
        <template v-else>{{ field.label }}</template>
      </PresenceText>
    </dt>
    <dd class="row__value">
      <PresenceText :presence="item.presence">
        <TextChange v-if="valueEdit" :before="valueEdit.before" :after="valueEdit.after" />
        <template v-else>{{ field.value }}</template>
      </PresenceText>
      <NodeBadges :changes="item.changes" />
    </dd>
  </div>
</template>

<style scoped>
.row {
  display: grid;
  grid-template-columns: minmax(var(--label-width), 30%) 1fr;
  gap: var(--space-3);
  padding: var(--space-1) var(--space-2);
  border-inline-start: var(--edge-change) solid transparent;
}

.row__label {
  color: var(--muted);
}

.row__value {
  margin: 0;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}

.row--added {
  border-inline-start-color: var(--added-text);
  background: var(--added-bg);
}

.row--removed {
  border-inline-start-color: var(--removed-text);
  background: var(--removed-bg);
}

.row--added .row__label {
  color: var(--added-text);
}
</style>
