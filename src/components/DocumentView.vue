<script setup lang="ts">
import type { ViewItem } from '@/domain/diff'
import NodeList from './NodeList.vue'

defineProps<{ tree: readonly ViewItem[] }>()
</script>

<template>
  <div class="document">
    <NodeList :items="tree" :level="2" />
  </div>
</template>

<style scoped>
.document {
  max-inline-size: var(--document-width);
}
</style>
