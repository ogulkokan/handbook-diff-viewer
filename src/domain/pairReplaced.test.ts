import { describe, expect, it } from 'vitest'

import { diffDocuments, type Change, type ViewItem, type ViewNode } from './diff'
import { v1, v2, v3 } from './fixtures'
import { pairReplaced } from './pairReplaced'
import { isFormattingChange } from './view'

// Expected values: docs/SPEC.md rows 6 and 7, and "Expected changes".

function find(items: readonly ViewItem[], id: string): ViewNode | undefined {
  for (const item of items) {
    if (item.kind !== 'node') continue
    if (item.node.id === id) return item
    const below = find(item.children, id)
    if (below) return below
  }
  return undefined
}

const of = (changes: readonly Change[], id: string) =>
  changes.filter((change) => change.nodeId === id).map((change) => change.kind)

describe('pairReplaced (D6)', () => {
  const paired = pairReplaced(diffDocuments(v1, v2))

  it('v1 to v2: pairs cl-sec-passwords with cl-sec-credentials as one change', () => {
    expect(of(paired.changes, 'cl-sec-credentials')).toEqual(['replaced'])
    expect(of(paired.changes, 'cl-sec-passwords')).toEqual([])
    expect(paired.changes.find((change) => change.nodeId === 'cl-sec-credentials')).toMatchObject({
      kind: 'replaced',
      fromNodeId: 'cl-sec-passwords',
      edits: [{ part: 'title', before: 'Passwords', after: 'Credentials' }],
    })
  })

  it('v1 to v2: does not pair cl-tool-trello with cl-tool-cursor', () => {
    // Both hold the labels Vendor and Status, with other values: two different tools.
    expect(of(paired.changes, 'cl-tool-trello')).toEqual(['removed'])
    expect(of(paired.changes, 'cl-tool-cursor')).toEqual(['added'])
  })

  it('v1 to v2: shows the one word that differs inside the pair', () => {
    // data: "wherever it is offered." in v1, "wherever it is available." in v2.
    const paragraph = find(paired.tree, 'p-sec-credentials-1')!
    const edit = paragraph.changes.flatMap((change) =>
      change.kind === 'edited' ? change.edits : [],
    )[0]!

    expect(edit.parts!.filter((part) => part.kind === 'removed').map((part) => part.text)).toEqual([
      'offered',
    ])
    expect(edit.parts!.filter((part) => part.kind === 'added').map((part) => part.text)).toEqual([
      'available',
    ])
  })

  it('v1 to v2: the pair is one change, so the reader sees 11 changes, not 12', () => {
    // docs/SPEC.md: 12 changes with one removed and one added clause. The pair makes them one.
    expect(paired.changes.filter((change) => !isFormattingChange(change))).toHaveLength(11)
  })

  it('v1 to v2: the removed clause is gone from the view, and the pair stands in its place', () => {
    const security = find(paired.tree, 'sec-security')!

    expect(security.children.map((item) => item.node.id).slice(0, 2)).toEqual([
      'cl-sec-credentials',
      'cl-sec-devices',
    ])
    expect(find(paired.tree, 'cl-sec-credentials')).toMatchObject({ presence: 'both' })
  })

  it('v2 to v3: changes nothing, because no removed and added node are alike', () => {
    const before = diffDocuments(v2, v3)

    expect(pairReplaced(before).changes).toEqual(before.changes)
  })

  it('v1 to v3: pairs the same two clauses', () => {
    const changes = pairReplaced(diffDocuments(v1, v3)).changes

    expect(of(changes, 'cl-sec-credentials')).toEqual(['replaced'])
    expect(changes.filter((change) => !isFormattingChange(change))).toHaveLength(20)
  })
})
