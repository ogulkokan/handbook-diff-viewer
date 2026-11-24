import { onWatcherCleanup, readonly, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'

/**
 * Tells which of the given elements is at the middle of the viewport.
 * When two of them are (a section and a section inside it), the later one in the list wins.
 */
export function useScrollSpy(targetIds: MaybeRefOrGetter<readonly string[]>) {
  const activeId = ref<string | null>(null)

  watch(
    () => toValue(targetIds),
    (ids) => {
      // jsdom has no IntersectionObserver. The outline then marks nothing.
      if (typeof IntersectionObserver === 'undefined') return

      const atMiddle = new Set<string>()
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) atMiddle.add(entry.target.id)
            else atMiddle.delete(entry.target.id)
          }
          const current = ids.findLast((id) => atMiddle.has(id))
          if (current !== undefined) activeId.value = current
        },
        // A line across the middle of the viewport: one target crosses it at a time.
        { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
      )

      for (const id of ids) {
        const element = document.getElementById(id)
        if (element) observer.observe(element)
      }
      onWatcherCleanup(() => observer.disconnect())
    },
    // 'post': the targets must be in the page before the observer looks for them.
    { immediate: true, flush: 'post' },
  )

  return { activeId: readonly(activeId) }
}
