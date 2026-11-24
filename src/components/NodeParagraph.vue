<script setup lang="ts">
import { computed } from 'vue'

import type { ViewNode } from '@/domain/diff'
import { plainText } from '@/domain/text'
import { editOf } from '@/domain/view'
import NodeBadges from './NodeBadges.vue'
import TextChange from './TextChange.vue'

const { item } = defineProps<{ item: ViewNode }>()

const paragraph = computed(() => {
  if (item.node.type !== 'paragraph') throw new Error(`NodeParagraph got a ${item.node.type}`)
  return item.node
})
const edit = computed(() => editOf(item.changes, 'text'))
</script>

<template>
  <p :id="paragraph.id" class="text" :class="`text--${item.presence}`" tabindex="-1">
    <span class="text__body">
      <TextChange
        v-if="edit"
        :before="edit.before === undefined ? undefined : plainText(edit.before)"
        :after="edit.after === undefined ? undefined : plainText(edit.after)"
        words
      />
      <template v-else>{{ plainText(paragraph.text) }}</template>
    </span>
    <NodeBadges :changes="item.changes" />
  </p>
</template>

<style scoped>
.text {
  margin: 0 0 var(--space-2);
  padding: var(--space-1) var(--space-2);
  max-inline-size: var(--measure);
  border-inline-start: 3px solid transparent;
}

.text--added {
  border-inline-start-color: var(--added-text);
  background: var(--added-bg);
}

.text--removed {
  border-inline-start-color: var(--removed-text);
  background: var(--removed-bg);
}

.text--removed .text__body {
  color: var(--removed-text);
  text-decoration: line-through;
}
</style>
