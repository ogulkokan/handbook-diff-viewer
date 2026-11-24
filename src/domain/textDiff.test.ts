import { describe, expect, it } from 'vitest'

import { diffDocuments } from './diff'
import { v2, v3 } from './fixtures'
import { diffWords, type TextPart } from './textDiff'

const textOf = (parts: readonly TextPart[], ...kinds: TextPart['kind'][]) =>
  parts
    .filter((part) => kinds.includes(part.kind))
    .map((part) => part.text)
    .join('')

const only = (parts: readonly TextPart[], kind: TextPart['kind']) =>
  parts.filter((part) => part.kind === kind).map((part) => part.text)

describe('diffWords', () => {
  it('v2 to v3, p-travel-flights-1: marks "six" as removed and "eight" as added', () => {
    // docs/SPEC.md: "flights under six hours" becomes "flights under eight hours".
    const edit = diffDocuments(v2, v3)
      .changes.filter((change) => change.kind === 'edited')
      .find((change) => change.nodeId === 'p-travel-flights-1')!.edits[0]!

    const parts = diffWords(edit.before!, edit.after!)

    expect(only(parts, 'removed')).toEqual(['six'])
    expect(only(parts, 'added')).toEqual(['eight'])
  })

  it('gives back both texts: same and removed parts are the earlier text', () => {
    const before = 'Book economy class for flights under six hours.'
    const after = 'Book economy for all flights under eight hours, please.'

    const parts = diffWords(before, after)

    expect(textOf(parts, 'same', 'removed')).toBe(before)
    expect(textOf(parts, 'same', 'added')).toBe(after)
  })

  it('treats a punctuation mark as its own word', () => {
    const parts = diffWords('Within 4 working hours.', 'Within 4 working hours')

    expect(only(parts, 'removed')).toEqual(['.'])
    expect(only(parts, 'added')).toEqual([])
  })

  it('joins neighbours of one kind into one part', () => {
    const parts = diffWords('one two three', 'one four five six')

    expect(parts).toEqual([
      { kind: 'same', text: 'one ' },
      { kind: 'removed', text: 'two three' },
      { kind: 'added', text: 'four five six' },
    ])
  })

  it('gives one same part for equal texts and no part for empty texts', () => {
    expect(diffWords('equal text', 'equal text')).toEqual([{ kind: 'same', text: 'equal text' }])
    expect(diffWords('', '')).toEqual([])
  })
})
