import { computed, onMounted, onUnmounted, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'

import type { Change } from '@/domain/diff'

/** Opens each fold around an element, so that a jump to it lands on something in view. */
function reveal(element: Element): void {
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    if (parent instanceof HTMLDetailsElement) parent.open = true
  }
}

function idInHash(): string | null {
  const raw = location.hash.slice(1)
  if (raw === '') return null
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

/**
 * The change that the reader is at, and the moves to the next and the previous one.
 * The hash of the address holds the selected node, so a link opens at the same change (US7).
 */
export function useChangeNavigation(changes: MaybeRefOrGetter<readonly Change[]>) {
  const selectedId = ref<string | null>(null)

  // A node with two changes, such as moved and edited, is one stop.
  const stops = computed(() => [...new Set(toValue(changes).map((change) => change.nodeId))])
  const position = computed(() =>
    selectedId.value === null ? -1 : stops.value.indexOf(selectedId.value),
  )

  /** Moves the page and the focus to a node, and makes it the selected one. */
  function goTo(id: string): void {
    const element = document.getElementById(id)
    if (!element) return
    reveal(element)
    selectedId.value = id
    history.replaceState(history.state, '', `${location.pathname}${location.search}#${id}`)
    // The page scrolls smoothly or at once: base.css decides with prefers-reduced-motion.
    // jsdom has no scrollIntoView.
    element.scrollIntoView?.({ block: 'start' })
    // After a programmatic scroll, focus must not scroll a second time.
    element.focus({ preventScroll: true })
  }

  function next(): void {
    const id = stops.value[position.value + 1]
    if (id !== undefined) goTo(id)
  }

  function previous(): void {
    const id = stops.value[position.value - 1]
    if (id !== undefined) goTo(id)
  }

  // A link in the outline or in the change list is a plain link to the id of a node.
  // The browser does the jump. Before it does, the folds around the target must be open.
  function onClick(event: MouseEvent): void {
    if (!(event.target instanceof Element)) return
    const href = event.target.closest('a')?.getAttribute('href')
    if (!href?.startsWith('#')) return
    const element = document.getElementById(href.slice(1))
    if (element) reveal(element)
  }

  function onHashChange(): void {
    selectedId.value = idInHash()
  }

  onMounted(() => {
    document.addEventListener('click', onClick)
    window.addEventListener('hashchange', onHashChange)
  })
  onUnmounted(() => {
    document.removeEventListener('click', onClick)
    window.removeEventListener('hashchange', onHashChange)
  })

  // The versions load after the page. A link with a hash can jump only when its node is there.
  let jumpedFromLink = false
  watch(
    stops,
    (ids) => {
      if (!jumpedFromLink && ids.length > 0) {
        jumpedFromLink = true
        const id = idInHash()
        if (id !== null) goTo(id)
        return
      }
      // Another comparison can have no change at the selected node.
      if (selectedId.value !== null && !document.getElementById(selectedId.value)) {
        selectedId.value = null
      }
    },
    { flush: 'post' },
  )

  return {
    selectedId,
    /** The place of the selected change among the stops, from 0. -1 when no change is selected. */
    position,
    count: computed(() => stops.value.length),
    hasNext: computed(() => position.value < stops.value.length - 1),
    hasPrevious: computed(() => position.value > 0),
    goTo,
    next,
    previous,
  }
}
