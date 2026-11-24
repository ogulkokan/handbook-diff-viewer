import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  shallowReadonly,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'

import type { Change } from '@/domain/diff'

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
 * The node that the reader is at, and the moves to the next and the previous change.
 * The hash of the address holds that node, so a link opens at the same place (US7).
 *
 * `reveal` opens the folds around an element before a jump to it.
 */
export function useChangeNavigation(
  changes: MaybeRefOrGetter<readonly Change[]>,
  reveal: (element: Element) => void,
) {
  // The node of the last jump: a change, or a section or a clause from the outline.
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
    history.replaceState(
      history.state,
      '',
      `${location.pathname}${location.search}#${encodeURIComponent(id)}`,
    )
    // The page scrolls smoothly or at once: base.css decides with prefers-reduced-motion.
    // jsdom has no scrollIntoView.
    element.scrollIntoView?.({ block: 'start' })
    // After a programmatic scroll, focus must not scroll a second time.
    element.focus({ preventScroll: true })
  }

  // The stops before or after the reader's place, when that place is not a stop itself:
  // for example a section that the reader reached through the outline.
  function stopsFromHere(direction: 'before' | 'after'): string[] {
    const here = selectedId.value === null ? null : document.getElementById(selectedId.value)
    if (!here) return direction === 'after' ? stops.value : []
    const wanted =
      direction === 'after' ? Node.DOCUMENT_POSITION_FOLLOWING : Node.DOCUMENT_POSITION_PRECEDING
    return stops.value.filter((id) => {
      const element = document.getElementById(id)
      return element !== null && (here.compareDocumentPosition(element) & wanted) !== 0
    })
  }

  function next(): void {
    const id = position.value === -1 ? stopsFromHere('after')[0] : stops.value[position.value + 1]
    if (id !== undefined) goTo(id)
  }

  function previous(): void {
    const id =
      position.value === -1 ? stopsFromHere('before').at(-1) : stops.value[position.value - 1]
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
  let comparisonsSeen = 0
  watch(
    () => toValue(changes),
    () => {
      comparisonsSeen++
      if (comparisonsSeen === 1) {
        const id = idInHash()
        if (id !== null) goTo(id)
        return
      }
      // In another comparison the selected node can be gone from the page.
      if (selectedId.value !== null && !document.getElementById(selectedId.value)) {
        selectedId.value = null
      }
    },
    { flush: 'post' },
  )

  return {
    /** Read-only: a move goes through goTo, next or previous. */
    selectedId: shallowReadonly(selectedId),
    /** The place of the selected change among the stops, from 0. -1 when the reader is not at a change. */
    position,
    count: computed(() => stops.value.length),
    hasNext: computed(() =>
      position.value === -1 ? stops.value.length > 0 : position.value < stops.value.length - 1,
    ),
    hasPrevious: computed(() =>
      position.value === -1 ? selectedId.value !== null : position.value > 0,
    ),
    goTo,
    next,
    previous,
  }
}
