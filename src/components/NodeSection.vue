<script setup lang="ts">
import { computed } from 'vue'

import type { ViewNode } from '@/domain/diff'
import { editOf } from '@/domain/view'
import MovedAwayNote from './MovedAwayNote.vue'
import NodeBadges from './NodeBadges.vue'
import NodeClause from './NodeClause.vue'
import PresenceText from './PresenceText.vue'
import TextChange from './TextChange.vue'

const { item, level } = defineProps<{
  item: ViewNode
  /** The heading level of the title, from 2 to 5. */
  level: number
}>()

const section = computed(() => {
  if (item.node.type !== 'section') throw new Error(`NodeSection got a ${item.node.type}`)
  return item.node
})
const titleEdit = computed(() => editOf(item.changes, 'title'))
</script>

<template>
  <!-- tabindex="-1": a jump from the outline can give the section focus. -->
  <section
    :id="section.id"
    class="section"
    :class="`section--${item.presence}`"
    tabindex="-1"
    :aria-labelledby="`${section.id}-title`"
  >
    <component :is="`h${level}`" :id="`${section.id}-title`" class="section__title">
      <PresenceText :presence="item.presence">
        <TextChange v-if="titleEdit" :before="titleEdit.before" :after="titleEdit.after" />
        <template v-else>{{ section.title }}</template>
      </PresenceText>
      <NodeBadges :changes="item.changes" />
    </component>

    <template
      v-for="child in item.children"
      :key="child.kind === 'node' ? child.node.id : `marker-${child.node.id}`"
    >
      <MovedAwayNote v-if="child.kind === 'moved-away'" :marker="child" />
      <NodeSection v-else-if="child.node.type === 'section'" :item="child" :level="level + 1" />
      <NodeClause v-else :item="child" :level="level + 1" />
    </template>
  </section>
</template>

<style scoped>
.section {
  margin-block-end: var(--space-6);
  border-inline-start: var(--edge-change) solid transparent;
}

.section .section {
  margin-block: var(--space-4) 0;
  padding-inline-start: var(--space-4);
  border-inline-start: 2px solid var(--border);
}

.section__title {
  margin: 0 0 var(--space-2);
  padding-inline-start: var(--space-2);
  font-size: var(--text-lg);
  font-weight: 650;
}

.section .section .section__title {
  font-size: var(--text-md);
}

.section--added {
  border-inline-start-color: var(--added-text);
}

.section--removed {
  border-inline-start-color: var(--removed-text);
}
</style>
