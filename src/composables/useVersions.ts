import { readonly, ref, shallowReadonly, shallowRef } from 'vue'

import { parseDocument } from '@/domain/parseDocument'
import type { HandbookDocument } from '@/domain/types'

// Each file in data/ that is named like v1.json is one version. A new file needs no code change.
const files = import.meta.glob<unknown>('../../data/v*.json', { import: 'default' })

/** Loads each version of the document once, oldest first. */
export function useVersions() {
  const documents = shallowRef<readonly HandbookDocument[]>([])
  const error = ref<string | null>(null)
  const isLoading = ref(true)

  async function load(): Promise<void> {
    try {
      const raws = await Promise.all(Object.values(files).map((read) => read()))
      documents.value = raws.map(parseDocument).sort((a, b) => a.version - b.version)
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : String(cause)
    } finally {
      isLoading.value = false
    }
  }

  void load()

  return {
    documents: shallowReadonly(documents),
    error: readonly(error),
    isLoading: readonly(isLoading),
  }
}
