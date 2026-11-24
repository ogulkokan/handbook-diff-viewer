<script setup lang="ts">
import type { ViewItem } from '@/domain/diff'
import MovedAwayNote from './MovedAwayNote.vue'
import NodeClause from './NodeClause.vue'
import NodeSection from './NodeSection.vue'

defineProps<{ tree: readonly ViewItem[] }>()
</script>

<template>
  <div class="document">
    <template
      v-for="item in tree"
      :key="item.kind === 'node' ? item.node.id : `marker-${item.node.id}`"
    >
      <MovedAwayNote v-if="item.kind === 'moved-away'" :marker="item" />
      <NodeSection v-else-if="item.node.type === 'section'" :item="item" :level="2" />
      <NodeClause v-else :item="item" :level="2" />
    </template>
  </div>
</template>

<style scoped>
.document {
  max-inline-size: var(--document-width);
}
</style>
