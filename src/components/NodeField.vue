<script setup lang="ts">
import { computed } from 'vue'

import type { ViewNode } from '@/domain/diff'
import { editOf } from '@/domain/view'
import NodeBadges from './NodeBadges.vue'
import TextChange from './TextChange.vue'

const { item } = defineProps<{ item: ViewNode }>()

const field = computed(() => {
  if (item.node.type !== 'field') throw new Error(`NodeField got a ${item.node.type}`)
  return item.node
})
const labelEdit = computed(() => editOf(item.changes, 'label'))
const valueEdit = computed(() => editOf(item.changes, 'value'))
</script>

<template>
  <div :id="field.id" class="row" :class="`row--${item.presence}`" tabindex="-1">
    <dt class="row__label">
      <TextChange v-if="labelEdit" :before="labelEdit.before" :after="labelEdit.after" />
      <template v-else>{{ field.label }}</template>
    </dt>
    <dd class="row__value">
      <span class="row__text">
        <TextChange v-if="valueEdit" :before="valueEdit.before" :after="valueEdit.after" />
        <template v-else>{{ field.value }}</template>
      </span>
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
  border-inline-start: 3px solid transparent;
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

.row--removed .row__label,
.row--removed .row__text {
  color: var(--removed-text);
  text-decoration: line-through;
}

.row--added .row__label {
  color: var(--added-text);
}
</style>
