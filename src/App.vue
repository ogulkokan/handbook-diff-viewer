<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue'

import DocumentView from '@/components/DocumentView.vue'
import OutlineTree from '@/components/OutlineTree.vue'
import { useScrollSpy } from '@/composables/useScrollSpy'
import { useVersions } from '@/composables/useVersions'
import type { ClauseNode, SectionNode } from '@/domain/types'

const { documents, error, isLoading } = useVersions()

const chosenVersion = ref<number | null>(null)

// Until the reader chooses, the app shows the latest version.
const current = computed(
  () =>
    documents.value.find((document) => document.version === chosenVersion.value) ??
    documents.value.at(-1) ??
    null,
)

function sectionIds(nodes: ReadonlyArray<SectionNode | ClauseNode>): string[] {
  return nodes.flatMap((node) =>
    node.type === 'section' ? [node.id, ...sectionIds(node.children)] : [],
  )
}

const { activeId } = useScrollSpy(() => (current.value ? sectionIds(current.value.children) : []))

// The outline is longer than the screen. Keep the marked item in view inside the panel.
const panel = useTemplateRef('panel')
watch(activeId, (id) => {
  if (id === null) return
  const link = panel.value?.querySelector(`a[href="#${CSS.escape(id)}"]`)
  link?.scrollIntoView({ block: 'nearest' })
})
</script>

<template>
  <header class="bar">
    <h1 class="bar__title">{{ current?.title ?? 'Handbook diff viewer' }}</h1>

    <label v-if="current" class="bar__field">
      <span>Version</span>
      <select
        :value="current.version"
        @change="chosenVersion = Number(($event.target as HTMLSelectElement).value)"
      >
        <option v-for="document in documents" :key="document.version" :value="document.version">
          Version {{ document.version }} ({{ document.updatedAt }})
        </option>
      </select>
    </label>
  </header>

  <p v-if="isLoading" class="notice" role="status">The document is loading.</p>
  <p v-else-if="error" class="notice" role="alert">The document did not load. {{ error }}</p>

  <div v-else-if="current" class="layout">
    <nav ref="panel" class="panel" aria-label="Outline">
      <OutlineTree :nodes="current.children" :active-id="activeId" />
    </nav>
    <main class="reading">
      <DocumentView :document="current" />
    </main>
  </div>
</template>

<style scoped>
.bar {
  position: sticky;
  inset-block-start: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: var(--space-5);
  block-size: var(--bar-height);
  padding-inline: var(--space-4);
  background: var(--bg);
  border-block-end: 1px solid var(--border);
}

.bar__title {
  margin: 0;
  font-size: var(--text-md);
  font-weight: 650;
}

.bar__field {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--muted);
  font-size: var(--text-sm);
}

.bar__field select {
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--border-control);
  border-radius: var(--radius);
  background: var(--bg);
  color: var(--text);
  font: inherit;
}

.notice {
  margin: var(--space-5) var(--space-4);
}

.layout {
  display: grid;
  grid-template-columns: var(--panel-width) minmax(0, 1fr);
}

.panel {
  position: sticky;
  inset-block-start: var(--bar-height);
  align-self: start;
  block-size: calc(100vh - var(--bar-height));
  overflow-y: auto;
  padding: var(--space-4) var(--space-2);
  border-inline-end: 1px solid var(--border);
  font-size: var(--text-sm);
}

.reading {
  padding: var(--space-5) var(--space-6);
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .panel {
    position: static;
    block-size: auto;
    max-block-size: 40vh;
    border-inline-end: 0;
    border-block-end: 1px solid var(--border);
  }
}
</style>
