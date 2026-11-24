import { ref, shallowReadonly } from 'vue'

/**
 * Which folds of unchanged nodes are open. The state is here, not only in the page, so that a
 * fold keeps its state when its list renders again.
 */
export function useFolds() {
  const open = ref<ReadonlySet<string>>(new Set())

  function setFoldOpen(key: string, isOpen: boolean): void {
    if (open.value.has(key) === isOpen) return
    const next = new Set(open.value)
    if (isOpen) next.add(key)
    else next.delete(key)
    open.value = next
  }

  /**
   * Opens each fold around an element, so that a jump to it lands on something in view.
   * The element is opened at once, before the next render: a link that was just clicked
   * jumps in the same tick.
   */
  function reveal(element: Element): void {
    for (let parent = element.parentElement; parent; parent = parent.parentElement) {
      if (parent instanceof HTMLDetailsElement && parent.dataset.fold !== undefined) {
        parent.open = true
        setFoldOpen(parent.dataset.fold, true)
      }
    }
  }

  return { openFolds: shallowReadonly(open), setFoldOpen, reveal }
}
