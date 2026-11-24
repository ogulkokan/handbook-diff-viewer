import { describe, expect, it } from 'vitest'

import { diffDocuments, type Change, type ViewItem, type ViewNode } from './diff'
import { v1, v2, v3 } from './fixtures'
import { pairReplaced } from './pairReplaced'
import { parseDocument } from './parseDocument'
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

// Small documents for cases that the three data files do not hold.
function documentOf(children: unknown[]) {
  return parseDocument({ id: 'doc', version: 1, title: 'T', updatedAt: '2026-01-01', children })
}
const section = (id: string, children: unknown[]) => ({ id, type: 'section', title: id, children })
const clause = (id: string, children: unknown[]) => ({ id, type: 'clause', title: id, children })
const field = (id: string, value: string) => ({ id, type: 'field', label: id, value })
const paragraph = (id: string, text: string) => ({ id, type: 'paragraph', text })

describe('pairReplaced: limits', () => {
  it('does not pair a lone field with another field of the same clause', () => {
    // Card 007, out of scope: a pair of leaves with no parent pair.
    const base = documentOf([section('s', [clause('c', [field('f-status', 'Approved')])])])
    const target = documentOf([section('s', [clause('c', [field('f-tier', 'Approved')])])])

    const changes = pairReplaced(diffDocuments(base, target)).changes

    expect(of(changes, 'f-status')).toEqual(['removed'])
    expect(of(changes, 'f-tier')).toEqual(['added'])
  })

  it('matches the nodes inside a pair by type, and shows what differs as part of the pair', () => {
    const text = 'Use the password manager for each work account that you have.'
    const base = documentOf([
      section('s', [clause('c-old', [paragraph('p-old', text), field('f-gone', 'x')])]),
    ])
    const target = documentOf([
      section('s', [clause('c-new', [paragraph('p-new', text), field('f-extra', 'y')])]),
    ])

    const paired = pairReplaced(diffDocuments(base, target))

    expect(of(paired.changes, 'c-new')).toEqual(['replaced'])
    // The two fields match by type. Their difference shows inside the pair, as part of it.
    expect(of(paired.changes, 'f-extra')).toEqual([])
    expect(find(paired.tree, 'f-extra')).toMatchObject({
      presence: 'both',
      changes: [{ kind: 'edited', partOf: 'c-new' }],
    })
    expect(find(paired.tree, 'p-new')).toMatchObject({ presence: 'both', changes: [] })
  })

  it('marks a node inside a pair with no node to match as added or removed', () => {
    const text = 'Use the password manager for each work account that you have.'
    const base = documentOf([section('s', [clause('c-old', [paragraph('p-old', text)])])])
    const target = documentOf([
      section('s', [clause('c-new', [paragraph('p-new', text), field('f-extra', 'y')])]),
    ])

    const paired = pairReplaced(diffDocuments(base, target))

    expect(of(paired.changes, 'c-new')).toEqual(['replaced'])
    expect(of(paired.changes, 'f-extra')).toEqual(['added'])
    expect(find(paired.tree, 'f-extra')).toMatchObject({ presence: 'added' })
  })
})
