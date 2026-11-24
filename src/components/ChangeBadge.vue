<script setup lang="ts">
import { computed } from 'vue'

export type BadgeKind =
  'added' | 'removed' | 'edited' | 'moved' | 'reordered' | 'replaced' | 'formatting' | 'draft'

const { kind, detail = '' } = defineProps<{
  kind: BadgeKind
  /** Text after the label, for example the section that a clause moved from. */
  detail?: string
}>()

// A change kind is never shown by colour alone: each has a glyph and a word (ui.md rule 2).
const LOOK: Record<BadgeKind, { glyph: string; label: string; tone: string }> = {
  added: { glyph: '+', label: 'Added', tone: 'added' },
  removed: { glyph: '−', label: 'Removed', tone: 'removed' },
  edited: { glyph: '~', label: 'Edited', tone: 'edited' },
  moved: { glyph: '→', label: 'Moved', tone: 'moved' },
  reordered: { glyph: '↕', label: 'Reordered', tone: 'moved' },
  // "likely": the app guesses that two ids are one node (D6).
  replaced: { glyph: '⇄', label: 'Replaced, likely renamed', tone: 'edited' },
  formatting: { glyph: '≈', label: 'Formatting change', tone: 'neutral' },
  draft: { glyph: '◌', label: 'Draft', tone: 'neutral' },
}

const look = computed(() => LOOK[kind])
// One string, so that the space before the detail is part of the text.
const text = computed(() => (detail ? `${look.value.label} ${detail}` : look.value.label))
</script>

<template>
  <span class="badge" :class="`badge--${look.tone}`">
    <span class="badge__glyph" aria-hidden="true">{{ look.glyph }}</span>
    {{ text }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: baseline;
  gap: var(--space-1);
  padding: 0 var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 600;
  line-height: 1.5;
  white-space: nowrap;
  vertical-align: middle;
}

.badge__glyph {
  font-family: var(--font-mono);
}

.badge--added {
  background: var(--added-bg);
  color: var(--added-text);
}

.badge--removed {
  background: var(--removed-bg);
  color: var(--removed-text);
}

.badge--edited {
  background: var(--edited-bg);
  color: var(--edited-text);
}

.badge--moved {
  background: var(--moved-bg);
  color: var(--moved-text);
}

.badge--neutral {
  background: var(--neutral-bg);
  color: var(--neutral-text);
}
</style>
