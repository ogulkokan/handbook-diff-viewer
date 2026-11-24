<script setup lang="ts">
import { computed } from 'vue'

import { diffWords, type TextPart } from '@/domain/textDiff'

const {
  before,
  after,
  words = false,
} = defineProps<{
  /** undefined when the base version has no such text. */
  before: string | undefined
  after: string | undefined
  /** true: mark only the words that differ. false: show the earlier and the current text whole. */
  words?: boolean
}>()

const parts = computed<TextPart[]>(() => {
  if (words && before !== undefined && after !== undefined) return diffWords(before, after)
  const whole: TextPart[] = []
  if (before !== undefined) whole.push({ kind: 'removed', text: before })
  if (after !== undefined) whole.push({ kind: 'added', text: after })
  return whole
})
</script>

<template>
  <template v-for="(part, index) in parts" :key="index">
    <!-- The hidden words tell a screen reader what the line and the underline tell the eye. -->
    <del v-if="part.kind === 'removed'" class="was"
      ><span class="sr-only">Removed: </span>{{ part.text }}</del
    >
    <ins v-else-if="part.kind === 'added'" class="now"
      ><span class="sr-only">Added: </span>{{ part.text }}</ins
    >
    <template v-else>{{ part.text }}</template>
    <template v-if="!words && index < parts.length - 1">{{ ' ' }}</template>
  </template>
</template>

<style scoped>
.was,
.now {
  padding-inline: 2px;
  border-radius: var(--radius-sm);
  /* A change of spaces must stay visible. */
  white-space: pre-wrap;
}

/* The current words stand apart from the earlier words that they replace. */
.was + .now {
  margin-inline-start: 3px;
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
</style>
