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

// A word, a run of whitespace, or one punctuation mark.
const WORD = /\s+|[\p{L}\p{N}]+|[^\s\p{L}\p{N}]/gu
const WHITESPACE = /^\s+$/

/** A text as words, runs of whitespace and single punctuation marks. */
export function wordsOf(text: string): string[] {
  return text.match(WORD) ?? []
}

export interface Run<T> {
  kind: PartKind
  items: T[]
}

/**
 * Two lists of words as runs of words that are the same, removed or added.
 * In each changed place the removed run comes before the added run.
 */
export function diffRuns<T extends { text: string }>(
  before: readonly T[],
  after: readonly T[],
  equal: (x: T, y: T) => boolean,
): Array<Run<T>> {
  const steps = diffSequence(before, after, equal)
  const runs: Array<Run<T>> = []
  let removed: T[] = []
  let added: T[] = []

  const flush = () => {
    if (removed.length > 0) runs.push({ kind: 'removed', items: removed })
    if (added.length > 0) runs.push({ kind: 'added', items: added })
    removed = []
    added = []
  }

  steps.forEach((step, index) => {
    if (step.kind === 'removed') {
      removed.push(step.item)
    } else if (step.kind === 'added') {
      added.push(step.item)
    } else if (isSpaceBetweenChanges(steps, index)) {
      // A space that both texts share, with changed words on each side. Kept as "same", it would
      // cut one changed phrase into single words. It belongs to both the removed and the added run.
      removed.push(step.item)
      added.push(step.item)
    } else {
      flush()
      const last = runs.at(-1)
      if (last?.kind === 'same') last.items.push(step.item)
      else runs.push({ kind: 'same', items: [step.item] })
    }
  })
  flush()
  return runs
}

function isSpaceBetweenChanges<T extends { text: string }>(
  steps: ReadonlyArray<SequenceStep<T>>,
  index: number,
): boolean {
  const previous = steps[index - 1]
  const next = steps[index + 1]
  return (
    WHITESPACE.test(steps[index]!.item.text) &&
    previous !== undefined &&
    previous.kind !== 'same' &&
    next !== undefined &&
    next.kind !== 'same'
  )
}

export interface TextPart {
  kind: PartKind
  text: string
}

/**
 * The words that differ between two texts.
 * The "same" and "removed" parts give back the earlier text. The "same" and "added" parts give
 * back the current text.
 */
export function diffWords(before: string, after: string): TextPart[] {
  const items = (text: string) => wordsOf(text).map((word) => ({ text: word }))
  return diffRuns(items(before), items(after), (x, y) => x.text === y.text).map((run) => ({
    kind: run.kind,
    text: run.items.map((item) => item.text).join(''),
  }))
}
