<script setup lang="ts">
import { computed } from 'vue'

import type { InlinePart } from '@/domain/inline'
import InlineText from './InlineText.vue'

const { before, after, parts } = defineProps<{
  /** undefined when the base version has no such text. */
  before: string | undefined
  after: string | undefined
  /**
   * The words that differ, from the comparison. With no parts, the earlier and the current text
   * show whole, one after the other.
   */
  parts?: readonly InlinePart[]
}>()

// This component only renders. The comparison of the words is done in src/domain.
const shown = computed<readonly InlinePart[]>(() => {
  if (parts) return parts
  const whole: InlinePart[] = []
  if (before !== undefined) whole.push({ kind: 'removed', text: before, bold: false, href: null })
  if (after !== undefined) whole.push({ kind: 'added', text: after, bold: false, href: null })
  return whole
})
</script>

<template>
  <template v-for="(part, index) in shown" :key="index">
    <!-- The hidden words tell a screen reader what the line and the underline tell the eye. -->
    <del v-if="part.kind === 'removed'" class="was"
      ><span class="sr-only">Removed: </span><InlineText :tokens="[part]"
    /></del>
    <ins v-else-if="part.kind === 'added'" class="now"
      ><span class="sr-only">Added: </span><InlineText :tokens="[part]"
    /></ins>
    <InlineText v-else :tokens="[part]" />
    <template v-if="!parts && index < shown.length - 1">{{ ' ' }}</template>
  </template>
</template>

<style scoped>
.was,
.now {
  padding-inline: var(--space-half);
  border-radius: var(--radius-sm);
  /* A change of spaces must stay visible. */
  white-space: pre-wrap;
}

/* The current words stand apart from the earlier words that they replace. */
.was + .now {
  margin-inline-start: var(--space-half);
}

.was {
  background: var(--removed-bg);
  color: var(--removed-text);
  text-decoration: line-through;
}

.now {
  background: var(--added-bg);
  color: var(--added-text);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
}

/* A link inside a mark keeps the colour of the mark, so the mark stays readable. */
.was :deep(a),
.now :deep(a) {
  color: inherit;
}
</style>
