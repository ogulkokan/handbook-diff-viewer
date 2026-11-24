<script setup lang="ts">
import type { ClauseNode, SectionNode } from '@/domain/types'

defineProps<{
  nodes: ReadonlyArray<SectionNode | ClauseNode>
  /** The id of the section that is in view. */
  activeId: string | null
}>()
</script>

<template>
  <ul class="outline">
    <li v-for="node in nodes" :key="node.id" class="outline__item">
      <a
        class="outline__link"
        :class="{ 'outline__link--section': node.type === 'section' }"
        :href="`#${node.id}`"
        :aria-current="node.id === activeId ? 'true' : undefined"
      >
        {{ node.title }}
      </a>
      <OutlineTree v-if="node.type === 'section'" :nodes="node.children" :active-id="activeId" />
    </li>
  </ul>
</template>

<style scoped>
.outline {
  list-style: none;
  margin: 0;
  padding: 0;
}

.outline .outline {
  padding-inline-start: var(--space-3);
}

.outline__link {
  display: block;
  padding: var(--space-1) var(--space-2);
  border-inline-start: 2px solid transparent;
  color: var(--muted);
  text-decoration: none;
  overflow-wrap: anywhere;
}

.outline__link--section {
  color: var(--text);
  font-weight: 600;
}

.outline__link:hover {
  color: var(--text);
  background: var(--surface);
}

.outline__link[aria-current='true'] {
  border-inline-start-color: var(--accent);
  color: var(--accent);
}
</style>
