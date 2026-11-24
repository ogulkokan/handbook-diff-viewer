import { onUnmounted, ref } from 'vue'

/** Copies the address of the page, which holds the comparison and the selected change (US7). */
export function useCopyLink() {
  const message = ref('')
  let timer: ReturnType<typeof setTimeout> | undefined

  async function copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(location.href)
      message.value = 'The link is copied.'
    } catch {
      // Say so. A message that claims a copy when there was none is worse than no message.
      message.value = 'The link is not copied.'
    }
    // A second click starts the time again and does not stack timers.
    clearTimeout(timer)
    timer = setTimeout(() => (message.value = ''), 4000)
  }

  onUnmounted(() => clearTimeout(timer))

  return { message, copyLink }
}
