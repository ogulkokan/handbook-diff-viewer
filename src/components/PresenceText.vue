<script setup lang="ts">
import type { ViewNode } from '@/domain/diff'

defineProps<{ presence: ViewNode['presence'] }>()
</script>

<template>
  <!--
    The text of a node that the target version no longer holds. It is not current text, so it is a
    real <del> with hidden words for a screen reader, not only a line drawn with CSS (ui.md rule 3).
    This also holds for each node below a removed node, which has no badge of its own.
  -->
  <del v-if="presence === 'removed'" class="gone"
    ><span class="sr-only">Removed: </span><slot
  /></del>
  <span v-else><slot /></span>
</template>

<style scoped>
.gone {
  color: var(--removed-text);
  text-decoration: line-through;
}
</style>
