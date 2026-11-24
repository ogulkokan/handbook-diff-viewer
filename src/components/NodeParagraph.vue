<script setup lang="ts">
import { computed } from 'vue'

import type { ViewNode } from '@/domain/diff'
import { plainText } from '@/domain/text'
import { editOf } from '@/domain/view'
import NodeBadges from './NodeBadges.vue'
import PresenceText from './PresenceText.vue'
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
    <PresenceText :presence="item.presence">
      <TextChange v-if="edit" :before="edit.before" :after="edit.after" :parts="edit.parts" />
      <template v-else>{{ plainText(paragraph.text) }}</template>
    </PresenceText>
    <NodeBadges :changes="item.changes" />
  </p>
</template>

<style scoped>
.text {
  margin: 0 0 var(--space-2);
  padding: var(--space-1) var(--space-2);
  max-inline-size: var(--measure);
  border-inline-start: var(--edge-change) solid transparent;
}

.text--added {
  border-inline-start-color: var(--added-text);
  background: var(--added-bg);
}

.text--removed {
  border-inline-start-color: var(--removed-text);
  background: var(--removed-bg);
}
</style>
