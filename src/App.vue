<script setup lang="ts">
import { computed, useTemplateRef, watch, watchEffect } from 'vue'

import ChangeList from '@/components/ChangeList.vue'
import DocumentView from '@/components/DocumentView.vue'
import OutlineTree from '@/components/OutlineTree.vue'
import { provideViewContext } from '@/composables/comparisonContext'
import { parseUrlState, toSearch } from '@/composables/urlState'
import { useChangeNavigation } from '@/composables/useChangeNavigation'
import { useComparison } from '@/composables/useComparison'
import { useCopyLink } from '@/composables/useCopyLink'
import { useFolds } from '@/composables/useFolds'
import { useScrollSpy } from '@/composables/useScrollSpy'
import { useVersions } from '@/composables/useVersions'
import type { ClauseNode, SectionNode } from '@/domain/types'

const { documents, error, isLoading } = useVersions()
const {
  base,
  target,
  baseOptions,
  targetOptions,
  comparison,
  tree,
  changes,
  counts,
  formattingCount,
  showFormatting,
  changesOnly,
  chooseBase,
  chooseTarget,
} = useComparison(documents, parseUrlState(location.search))

const { openFolds, setFoldOpen, reveal } = useFolds()
const { selectedId, position, count, hasNext, hasPrevious, next, previous } = useChangeNavigation(
  changes,
  reveal,
)
const { message: copyMessage, copyLink } = useCopyLink()

provideViewContext({ comparison, counts, changesOnly, selectedId, openFolds, setFoldOpen })

// The address holds the comparison, so a copied link opens the same view (US7).
// It is written only when the versions are there: before that, the state is not known.
watchEffect(() => {
  if (!target.value) return
  const search = toSearch({
    base: base.value?.version ?? null,
    target: target.value.version,
    changesOnly: changesOnly.value,
    showFormatting: showFormatting.value,
  })
  history.replaceState(history.state, '', `${location.pathname}${search}${location.hash}`)
})

function sectionIds(nodes: ReadonlyArray<SectionNode | ClauseNode>): string[] {
  return nodes.flatMap((node) =>
    node.type === 'section' ? [node.id, ...sectionIds(node.children)] : [],
  )
}

const { activeId } = useScrollSpy(() => (target.value ? sectionIds(target.value.children) : []))

// The outline is longer than the screen. Keep the marked item in view inside its own list.
// scrollIntoView would also scroll the page, so only the scroll position of the list changes.
const outline = useTemplateRef('outline')
watch(activeId, (id) => {
  const box = outline.value
  if (id === null || !box || box.scrollHeight <= box.clientHeight) return
  const link = box.querySelector(`a[href="#${CSS.escape(id)}"]`)
  if (!link) return

  const boxRect = box.getBoundingClientRect()
  const linkRect = link.getBoundingClientRect()
  if (linkRect.top < boxRect.top) box.scrollTop -= boxRect.top - linkRect.top
  else if (linkRect.bottom > boxRect.bottom) box.scrollTop += linkRect.bottom - boxRect.bottom
})

const versionOf = (event: Event) => Number((event.target as HTMLSelectElement).value)

const changeCountText = computed(() =>
  changes.value.length === 1 ? '1 change' : `${changes.value.length} changes`,
)
const formattingText = computed(() => {
  const n = formattingCount.value
  const subject = n === 1 ? '1 formatting change is' : `${n} formatting changes are`
  return `${subject} ${showFormatting.value ? 'shown' : 'hidden'}.`
})
// "Change 3 of 10" when the reader is at a change. A full phrase, for the live region.
const positionText = computed(() =>
  position.value === -1 ? '' : `Change ${position.value + 1} of ${count.value}`,
)
</script>

<template>
  <header class="bar">
    <h1 class="bar__title">{{ target?.title ?? 'Handbook diff viewer' }}</h1>

    <template v-if="target">
      <div class="bar__group">
        <label class="bar__field">
          <span>Compare<span class="sr-only"> base version</span></span>
          <select
            :value="base?.version"
            :disabled="baseOptions.length === 0"
            @change="chooseBase(versionOf($event))"
          >
            <option
              v-for="document in baseOptions"
              :key="document.version"
              :value="document.version"
            >
              Version {{ document.version }} ({{ document.updatedAt }})
            </option>
          </select>
        </label>
        <label class="bar__field">
          <span>with<span class="sr-only"> target version</span></span>
          <select :value="target.version" @change="chooseTarget(versionOf($event))">
            <option
              v-for="document in targetOptions"
              :key="document.version"
              :value="document.version"
            >
              Version {{ document.version }} ({{ document.updatedAt }})
            </option>
          </select>
        </label>
      </div>

      <button
        class="bar__button"
        type="button"
        :aria-pressed="changesOnly"
        @click="changesOnly = !changesOnly"
      >
        Changes only
      </button>

      <div class="bar__group" role="group" aria-label="Move between changes">
        <button class="bar__button" type="button" :disabled="!hasPrevious" @click="previous">
          Previous change
        </button>
        <button class="bar__button" type="button" :disabled="!hasNext" @click="next">
          Next change
        </button>
      </div>

      <!-- One polite live region: a new count or a new place is read as a full phrase. -->
      <p class="bar__summary" role="status">
        <!-- At a change, the region says only where the reader is. -->
        <span v-if="positionText">{{ positionText }}</span>
        <template v-else>
          <strong>{{ changeCountText }}</strong>
          <!-- The space is part of the text, so a template formatter cannot drop it. -->
          <span v-if="formattingCount > 0" class="sr-only">{{ ` ${formattingText}` }}</span>
        </template>
      </p>

      <div class="bar__group">
        <button class="bar__button" type="button" @click="copyLink">Copy link</button>
        <!-- Outside the button, so the name of the button does not change. -->
        <span class="bar__copied" role="status">{{ copyMessage }}</span>
      </div>
    </template>
  </header>

  <p v-if="isLoading" class="notice" role="status">The document is loading.</p>
  <p v-else-if="error" class="notice" role="alert">The document did not load. {{ error }}</p>

  <!--
    Three columns, in the order of the page: the outline, the text, the change list.
    The order in the markup is the same, so the Tab key follows what the eye sees.
  -->
  <div v-else-if="target && comparison" class="layout">
    <nav ref="outline" class="side side--outline" aria-label="Outline">
      <h2 class="side__heading">Outline</h2>
      <OutlineTree :nodes="target.children" :active-id="activeId" :counts="counts" />
    </nav>
    <main class="reading">
      <DocumentView :tree="tree" />
    </main>
    <nav class="side side--changes" aria-labelledby="changes-heading">
      <h2 id="changes-heading" class="side__heading">Changes</h2>
      <p v-if="formattingCount > 0" class="side__formatting">
        {{ formattingText }}
        <button
          class="side__toggle"
          type="button"
          :aria-pressed="showFormatting"
          @click="showFormatting = !showFormatting"
        >
          Show formatting changes
        </button>
      </p>
      <ChangeList :changes="changes" :comparison="comparison" />
    </nav>
  </div>
</template>

<style scoped>
.bar {
  position: sticky;
  inset-block-start: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: var(--space-4);
  block-size: var(--bar-height);
  padding-inline: var(--space-4);
  background: var(--bg);
  border-block-end: 1px solid var(--border);
  font-size: var(--text-sm);
  white-space: nowrap;
}

.bar__title {
  margin: 0;
  font-size: var(--text-md);
  font-weight: 650;
}

.bar__group {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.bar__field {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--muted);
}

.bar__field select,
.bar__button,
.side__toggle {
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--border-control);
  border-radius: var(--radius);
  background: var(--bg);
  color: var(--text);
  font: inherit;
}

.bar__button,
.side__toggle {
  cursor: pointer;
}

.bar__button:disabled {
  border-color: var(--border);
  color: var(--muted);
  cursor: default;
}

/* The pressed state has a filled background and a thicker edge, not only another colour. */
.bar__button[aria-pressed='true'],
.side__toggle[aria-pressed='true'] {
  background: var(--neutral-bg);
  color: var(--neutral-text);
  box-shadow: inset 0 0 0 1px var(--border-control);
  font-weight: 600;
}

.bar__summary {
  margin: 0;
  margin-inline-start: auto;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}

.bar__copied {
  color: var(--muted);
}

.notice {
  margin: var(--space-5) var(--space-4);
}

.layout {
  display: grid;
  /* The side columns get narrower on a small window, and the text keeps a readable width. */
  grid-template-columns:
    clamp(200px, 20vw, var(--panel-width))
    minmax(0, 1fr)
    clamp(240px, 26vw, var(--changes-width));
}

/* Each side column stays in view and scrolls by itself. */
.side {
  /* Sticky is a positioned value, so the hidden screen reader text inside scrolls and clips
     with the list. Without a position, that text makes the page taller. */
  position: sticky;
  inset-block-start: var(--bar-height);
  align-self: start;
  block-size: calc(100vh - var(--bar-height));
  overflow-y: auto;
  padding: 0 var(--space-2) var(--space-2);
  font-size: var(--text-sm);
}

.side--outline {
  border-inline-end: 1px solid var(--border);
}

.side--changes {
  border-inline-start: 1px solid var(--border);
}

.side__heading {
  margin: var(--space-3) var(--space-2) var(--space-1);
  color: var(--muted);
  font-size: var(--text-sm);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.side__formatting {
  margin: 0 var(--space-2) var(--space-2);
  color: var(--muted);
}

.side__toggle {
  margin-block-start: var(--space-1);
}

.reading {
  padding: var(--space-5) var(--space-6);
  /* Room below the last section, so that a jump can put it at the top like each other one. */
  padding-block-end: var(--end-room);
}

/* Below three columns of full width, the controls of the top bar need two rows.
   tokens.css gives the height. */
@media (max-width: 1199px) {
  .bar {
    flex-wrap: wrap;
    align-content: center;
    row-gap: var(--space-2);
    white-space: normal;
  }
}

/* Too narrow for three columns: one column, in the order of the markup. */
@media (max-width: 999px) {
  .bar {
    block-size: auto;
    min-block-size: var(--bar-height);
    padding-block: var(--space-2);
  }

  .layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .side {
    position: relative;
    inset-block-start: auto;
    block-size: auto;
    max-block-size: 40vh;
    border-inline: 0;
    border-block-end: 1px solid var(--border);
  }
}
</style>
