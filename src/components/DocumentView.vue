<script setup lang="ts">
import type { HandbookDocument } from '@/domain/types'
import NodeClause from './NodeClause.vue'
import NodeSection from './NodeSection.vue'

defineProps<{ document: HandbookDocument }>()
</script>

<template>
  <div class="document">
    <template v-for="node in document.children" :key="node.id">
      <NodeSection v-if="node.type === 'section'" :node="node" :level="2" />
      <NodeClause v-else :node="node" :level="2" />
    </template>
  </div>
</template>

<style scoped>
.document {
  max-inline-size: 52rem;
}
</style>
