<script setup lang="ts">
import { computed } from 'vue'

import type { MovedAwayMarker, ViewNode } from '@/domain/diff'
import { editOf } from '@/domain/view'
import ChangeBadge from './ChangeBadge.vue'
import MovedAwayNote from './MovedAwayNote.vue'
import NodeBadges from './NodeBadges.vue'
import NodeField from './NodeField.vue'
import NodeParagraph from './NodeParagraph.vue'
import PresenceText from './PresenceText.vue'
import TextChange from './TextChange.vue'

const { item, level } = defineProps<{
  item: ViewNode
  /** The heading level of the title, from 3 to 6. */
  level: number
}>()

const clause = computed(() => {
  if (item.node.type !== 'clause') throw new Error(`NodeClause got a ${item.node.type}`)
  return item.node
})
const titleEdit = computed(() => editOf(item.changes, 'title'))
const statusEdit = computed(() => editOf(item.changes, 'status'))

type Block =
  | { kind: 'fields'; key: string; fields: ViewNode[] }
  | { kind: 'paragraph'; key: string; paragraph: ViewNode }
  | { kind: 'marker'; key: string; marker: MovedAwayMarker }

// Fields that follow each other form one description list. The display order stays the data order.
const blocks = computed<Block[]>(() => {
  const result: Block[] = []
  for (const child of item.children) {
    if (child.kind === 'moved-away') {
      result.push({ kind: 'marker', key: `marker-${child.node.id}`, marker: child })
    } else if (child.node.type === 'paragraph') {
      result.push({ kind: 'paragraph', key: child.node.id, paragraph: child })
    } else {
      const last = result.at(-1)
      if (last?.kind === 'fields') last.fields.push(child)
      else result.push({ kind: 'fields', key: child.node.id, fields: [child] })
    }
  }
  return result
})
</script>

<template>
  <article
    :id="clause.id"
    class="clause"
    :class="`clause--${item.presence}`"
    tabindex="-1"
    :aria-labelledby="`${clause.id}-title`"
  >
    <component :is="`h${level}`" :id="`${clause.id}-title`" class="clause__title">
      <PresenceText :presence="item.presence">
        <TextChange v-if="titleEdit" :before="titleEdit.before" :after="titleEdit.after" />
        <template v-else>{{ clause.title }}</template>
      </PresenceText>
      <ChangeBadge v-if="clause.status === 'draft'" class="clause__status" kind="draft" />
      <span v-else-if="clause.status" class="clause__status">{{ clause.status }}</span>
      <NodeBadges :changes="item.changes" />
    </component>

    <p v-if="statusEdit" class="clause__status-change">
      Status:
      <TextChange :before="statusEdit.before ?? 'none'" :after="statusEdit.after ?? 'none'" />
    </p>

    <template v-for="block in blocks" :key="block.key">
      <dl v-if="block.kind === 'fields'" class="clause__fields">
        <NodeField v-for="field in block.fields" :key="field.node.id" :item="field" />
      </dl>
      <NodeParagraph v-else-if="block.kind === 'paragraph'" :item="block.paragraph" />
      <MovedAwayNote v-else :marker="block.marker" />
    </template>
  </article>
</template>

<style scoped>
.clause {
  padding: var(--space-3) var(--space-2);
  border-block-start: 1px solid var(--border);
  border-inline-start: var(--edge-change) solid transparent;
}

.clause__title {
  margin: 0 0 var(--space-2);
  font-size: var(--text-md);
  font-weight: 600;
}

.clause__status {
  margin-inline-start: var(--space-2);
}

.clause__status-change {
  margin: 0 0 var(--space-2);
  color: var(--muted);
}

.clause__fields {
  margin: 0 0 var(--space-2);
}

.clause--added {
  border-inline-start-color: var(--added-text);
  background: var(--added-bg);
}

.clause--removed {
  border-inline-start-color: var(--removed-text);
  background: var(--removed-bg);
}
</style>
