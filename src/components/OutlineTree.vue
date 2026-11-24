<script setup lang="ts">
import type { ClauseNode, SectionNode } from '@/domain/types'

const { activeId } = defineProps<{
  nodes: ReadonlyArray<SectionNode | ClauseNode>
  /** The id of the section that is in view, or null when it is not in this list. */
  activeId: string | null
}>()

function holds(nodes: ReadonlyArray<SectionNode | ClauseNode>, id: string): boolean {
  return nodes.some(
    (node) => node.id === id || (node.type === 'section' && holds(node.children, id)),
  )
}

// A nested list gets the id only when it holds that section. The other lists get null,
// so they do not render again each time the section in view changes.
function activeIdFor(section: SectionNode): string | null {
  return activeId !== null && holds(section.children, activeId) ? activeId : null
}
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
      <OutlineTree
        v-if="node.type === 'section'"
        :nodes="node.children"
        :active-id="activeIdFor(node)"
      />
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
