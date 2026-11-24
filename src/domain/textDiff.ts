import { lcsPairs } from './lcs'

export type PartKind = 'same' | 'removed' | 'added'

export interface SequenceStep<T> {
  kind: PartKind
  /** For a "same" step, the item of the current list. */
  item: T
}

/** The steps that turn one list into another: keep, remove or add one item at a time. */
export function diffSequence<T>(
  before: readonly T[],
  after: readonly T[],
  equal: (x: T, y: T) => boolean = Object.is,
): Array<SequenceStep<T>> {
  const steps: Array<SequenceStep<T>> = []
  let i = 0
  let j = 0
  for (const [keptI, keptJ] of [...lcsPairs(before, after, equal), [before.length, after.length]]) {
    while (i < keptI!) steps.push({ kind: 'removed', item: before[i++]! })
    while (j < keptJ!) steps.push({ kind: 'added', item: after[j++]! })
    if (j < after.length) steps.push({ kind: 'same', item: after[j]! })
    i++
    j++
  }
  return steps
}

export interface TextPart {
  kind: PartKind
  text: string
}

// A word, a run of whitespace, or one punctuation mark.
const TOKEN = /\s+|[\p{L}\p{N}]+|[^\s\p{L}\p{N}]/gu
const WHITESPACE = /^\s+$/

/**
 * The words that differ between two texts.
 * The "same" and "removed" parts give back the earlier text. The "same" and "added" parts give
 * back the current text.
 */
export function diffWords(before: string, after: string): TextPart[] {
  const steps = diffSequence(before.match(TOKEN) ?? [], after.match(TOKEN) ?? [])
  const parts: TextPart[] = []
  let removed = ''
  let added = ''

  const flush = () => {
    if (removed) parts.push({ kind: 'removed', text: removed })
    if (added) parts.push({ kind: 'added', text: added })
    removed = ''
    added = ''
  }

  steps.forEach((step, index) => {
    if (step.kind === 'removed') {
      removed += step.item
    } else if (step.kind === 'added') {
      added += step.item
    } else if (isSpaceBetweenChanges(steps, index)) {
      // A space that both texts share, with changed words on each side. Kept as "same", it would
      // cut one changed phrase into single words. It belongs to both the removed and the added run.
      removed += step.item
      added += step.item
    } else {
      flush()
      const last = parts.at(-1)
      if (last?.kind === 'same') last.text += step.item
      else parts.push({ kind: 'same', text: step.item })
    }
  })
  flush()
  return parts
}

function isSpaceBetweenChanges(steps: ReadonlyArray<SequenceStep<string>>, index: number): boolean {
  const previous = steps[index - 1]
  const next = steps[index + 1]
  return (
    WHITESPACE.test(steps[index]!.item) &&
    previous !== undefined &&
    previous.kind !== 'same' &&
    next !== undefined &&
    next.kind !== 'same'
  )
}
