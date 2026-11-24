<script setup lang="ts">
import { computed } from 'vue'

import { plainText } from '@/domain/text'
import type { ClauseNode, FieldNode, ParagraphNode } from '@/domain/types'

const { node, level } = defineProps<{
  node: ClauseNode
  /** The heading level of the title, from 3 to 6. */
  level: number
}>()

type Block =
  | { kind: 'fields'; key: string; fields: FieldNode[] }
  | { kind: 'paragraph'; key: string; paragraph: ParagraphNode }

// Fields that follow each other form one description list. The display order stays the data order.
const blocks = computed<Block[]>(() => {
  const result: Block[] = []
  for (const child of node.children) {
    if (child.type === 'paragraph') {
      result.push({ kind: 'paragraph', key: child.id, paragraph: child })
      continue
    }
    const last = result.at(-1)
    if (last?.kind === 'fields') last.fields.push(child)
    else result.push({ kind: 'fields', key: child.id, fields: [child] })
  }
  return result
})
</script>

<template>
  <article :id="node.id" class="clause" tabindex="-1" :aria-labelledby="`${node.id}-title`">
    <component :is="`h${level}`" :id="`${node.id}-title`" class="clause__title">
      {{ node.title }}
    </component>

    <template v-for="block in blocks" :key="block.key">
      <dl v-if="block.kind === 'fields'" class="fields">
        <div v-for="field in block.fields" :id="field.id" :key="field.id" class="fields__row">
          <dt class="fields__label">{{ field.label }}</dt>
          <dd class="fields__value">{{ field.value }}</dd>
        </div>
      </dl>
      <p v-else :id="block.paragraph.id" class="clause__text">
        {{ plainText(block.paragraph.text) }}
      </p>
    </template>
  </article>
</template>

<style scoped>
.clause {
  padding-block: var(--space-3);
  border-block-start: 1px solid var(--border);
}

.clause__title {
  margin: 0 0 var(--space-2);
  font-size: var(--text-md);
  font-weight: 600;
}

.clause__text {
  margin: 0 0 var(--space-2);
  max-inline-size: var(--measure);
}

.fields {
  margin: 0 0 var(--space-2);
}

.fields__row {
  display: grid;
  grid-template-columns: minmax(10rem, 30%) 1fr;
  gap: var(--space-3);
  padding-block: var(--space-1);
}

.fields__label {
  color: var(--muted);
}

.fields__value {
  margin: 0;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
</style>
