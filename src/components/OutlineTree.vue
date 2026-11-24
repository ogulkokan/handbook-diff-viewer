<script setup lang="ts">
import type { ClauseNode, SectionNode } from '@/domain/types'

const { activeId, counts } = defineProps<{
  nodes: ReadonlyArray<SectionNode | ClauseNode>
  /** The id of the section that is in view, or null when it is not in this list. */
  activeId: string | null
  /** For each node that holds a change itself or below it: the number of those changes. */
  counts: ReadonlyMap<string, number>
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

function countText(count: number): string {
  return count === 1 ? '1 change' : `${count} changes`
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
        <span class="outline__title">{{ node.title }}</span>
        <!-- The number alone is for the eye. The full phrase is for a screen reader. -->
        <span v-if="counts.has(node.id)" class="outline__count">
          <span aria-hidden="true">{{ counts.get(node.id) }}</span>
          <span class="sr-only">, {{ countText(counts.get(node.id) ?? 0) }}</span>
        </span>
      </a>
      <OutlineTree
        v-if="node.type === 'section'"
        :nodes="node.children"
        :active-id="activeIdFor(node)"
        :counts="counts"
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
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
  border-inline-start: 2px solid transparent;
  color: var(--muted);
  text-decoration: none;
}

.outline__title {
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

.outline__count {
  flex: none;
  min-inline-size: 1.5em;
  padding-inline: var(--space-1);
  border-radius: var(--radius-sm);
  background: var(--edited-bg);
  color: var(--edited-text);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  text-align: center;
}
</style>
