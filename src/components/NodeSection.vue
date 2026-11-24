<script setup lang="ts">
import type { SectionNode } from '@/domain/types'
import NodeClause from './NodeClause.vue'

defineProps<{
  node: SectionNode
  /** The heading level of the title, from 2 to 5. */
  level: number
}>()
</script>

<template>
  <!-- tabindex="-1": a jump from the outline can give the section focus. -->
  <section :id="node.id" class="section" tabindex="-1" :aria-labelledby="`${node.id}-title`">
    <component :is="`h${level}`" :id="`${node.id}-title`" class="section__title">
      {{ node.title }}
    </component>

    <template v-for="child in node.children" :key="child.id">
      <NodeSection v-if="child.type === 'section'" :node="child" :level="level + 1" />
      <NodeClause v-else :node="child" :level="level + 1" />
    </template>
  </section>
</template>

<style scoped>
.section {
  margin-block-end: var(--space-6);
}

.section .section {
  margin-block: var(--space-4) 0;
  padding-inline-start: var(--space-4);
  border-inline-start: 2px solid var(--border);
}

.section__title {
  margin: 0 0 var(--space-2);
  font-size: var(--text-lg);
  font-weight: 650;
}

.section .section .section__title {
  font-size: var(--text-md);
}
</style>
