import { describe, expect, it } from 'vitest'

import { diffDocuments, type ViewItem, type ViewNode } from './diff'
import { v1, v2, v3 } from './fixtures'
import { pairReplaced } from './pairReplaced'
import {
  changeCounts,
  changesIn,
  describeChange,
  foldUnchanged,
  withoutFormattingChanges,
} from './view'

// Expected values: "Expected changes" in docs/SPEC.md and the order of the nodes in the data files.

function find(items: readonly ViewItem[], id: string): ViewNode | undefined {
  for (const item of items) {
    if (item.kind !== 'node') continue
    if (item.node.id === id) return item
    const below = find(item.children, id)
    if (below) return below
  }
  return undefined
}

const childIds = (node: ViewNode | undefined) =>
  (node?.children ?? []).map((item) => `${item.kind}:${item.node.id}`)

describe('the view tree of a comparison', () => {
  it('walks the changes in the same order as the change list', () => {
    for (const comparison of [
      diffDocuments(v1, v2),
      diffDocuments(v2, v3),
      diffDocuments(v1, v3),
    ]) {
      expect(changesIn(comparison.tree)).toEqual(comparison.changes)
    }
  })

  it('v1 to v2: puts the removed clause back at its earlier place, before the added one', () => {
    // v1 sec-security starts with cl-sec-passwords. v2 starts with cl-sec-credentials.
    const security = find(diffDocuments(v1, v2).tree, 'sec-security')

    expect(childIds(security).slice(0, 3)).toEqual([
      'node:cl-sec-passwords',
      'node:cl-sec-credentials',
      'node:cl-sec-devices',
    ])
    expect(find(security!.children, 'cl-sec-passwords')).toMatchObject({ presence: 'removed' })
    expect(find(security!.children, 'p-sec-passwords-1')).toMatchObject({
      presence: 'removed',
      changes: [],
    })
  })

  it('v1 to v2: leaves a marker where the moved clause was', () => {
    const tree = diffDocuments(v1, v2).tree
    const hours = find(tree, 'sec-hours')
    const marker = hours?.children.find((item) => item.kind === 'moved-away')

    expect(marker).toMatchObject({ node: { id: 'cl-hours-holidays' }, toParentId: 'sec-leave' })
    expect(find(tree, 'cl-hours-holidays')).toMatchObject({
      presence: 'both',
      changes: [{ kind: 'moved' }],
    })
  })

  it('v2 to v3: shows the removed field inside its clause', () => {
    const access = find(diffDocuments(v2, v3).tree, 'cl-sec-access')

    expect(childIds(access)).toContain('node:f-sec-access-cadence')
    expect(find(access!.children, 'f-sec-access-cadence')).toMatchObject({
      presence: 'removed',
      changes: [{ kind: 'removed' }],
    })
  })

  it('v2 to v3: marks each node of the added clause as added, with one change at the top', () => {
    const coworking = find(diffDocuments(v2, v3).tree, 'cl-remote-coworking')

    expect(coworking).toMatchObject({ presence: 'added', changes: [{ kind: 'added', size: 2 }] })
    expect(coworking!.children).toMatchObject([{ presence: 'added', changes: [] }])
  })
})

describe('changeCounts', () => {
  it('v2 to v3: counts the changes of each section, the nodes below it included', () => {
    const counts = changeCounts(diffDocuments(v2, v3).tree)

    // From docs/SPEC.md: 1 title, 2 paragraphs, 1 removed field, 4 tools, 1 response time, 1 new clause.
    expect(counts.get('sec-hours')).toBe(1)
    expect(counts.get('sec-expenses')).toBe(2)
    expect(counts.get('sec-travel')).toBe(1)
    expect(counts.get('sec-security')).toBe(1)
    expect(counts.get('sec-tools')).toBe(4)
    expect(counts.get('sec-comms')).toBe(1)
    expect(counts.get('sec-remote')).toBe(1)
    expect(counts.has('sec-intro')).toBe(false)
  })
})

describe('withoutFormattingChanges', () => {
  it('v1 to v2: takes away the 2 formatting changes and keeps the 12 others', () => {
    const comparison = diffDocuments(v1, v2)
    const visible = changesIn(withoutFormattingChanges(comparison.tree))

    expect(comparison.changes).toHaveLength(14)
    expect(visible).toHaveLength(12)
    expect(visible.map((change) => change.nodeId)).not.toContain('p-leave-sick-1')
    expect(visible.map((change) => change.nodeId)).not.toContain('f-exp-equipment-limit')
  })
})

describe('describeChange', () => {
  const v1v2 = diffDocuments(v1, v2)
  const describe_ = (id: string) =>
    describeChange(
      v1v2,
      v1v2.changes.find((change) => change.nodeId === id)!,
    )

  it('names a field by its label, with the path to it and the part that changed', () => {
    // data/v2.json: the field "Days per year" is in the clause "Annual leave" of the section "Leave".
    expect(describe_('f-leave-annual-days')).toEqual({
      name: 'Days per year',
      path: ['Leave', 'Annual leave'],
      detail: 'Value changed',
    })
  })

  it('says "Label changed" when the label differs and the value does not', () => {
    expect(describe_('f-hours-overtime-max').detail).toBe('Label changed')
  })

  it('says "Text changed" for a paragraph, and "Title changed" for a section', () => {
    const v2v3 = diffDocuments(v2, v3)
    const of = (id: string) =>
      describeChange(
        v2v3,
        v2v3.changes.find((change) => change.nodeId === id)!,
      )

    expect(of('p-travel-flights-1')).toEqual({
      name: 'Paragraph',
      path: ['Expenses', 'Travel', 'Flights'],
      detail: 'Text changed',
    })
    expect(of('sec-hours')).toEqual({ name: 'Working Time', path: [], detail: 'Title changed' })
  })

  it('names a removed node from the base version, with no detail', () => {
    expect(describe_('cl-sec-passwords')).toEqual({
      name: 'Passwords',
      path: ['Security'],
      detail: '',
    })
  })

  it('says where a moved node came from', () => {
    expect(describe_('cl-hours-holidays')).toEqual({
      name: 'Public holidays',
      path: ['Leave'],
      detail: 'Moved from Working Hours',
    })
  })
})

describe('foldUnchanged (D10)', () => {
  const comparison = diffDocuments(v2, v3)
  const counts = changeCounts(comparison.tree)
  const tools = find(comparison.tree, 'sec-tools')!
  const folded = foldUnchanged(tools.children, counts)

  it('v2 to v3, sec-tools: keeps the 4 edited clauses on their own', () => {
    // docs/SPEC.md: the status or the vendor of Grammarly, Claude, Zapier and Dropbox changes.
    const shown = folded.flatMap((entry) => (entry.fold ? [] : [entry.item.node.id]))

    expect(shown.sort()).toEqual([
      'cl-tool-claude',
      'cl-tool-dropbox',
      'cl-tool-grammarly',
      'cl-tool-zapier',
    ])
  })

  it('v2 to v3, sec-tools: folds the 36 other clauses and loses none', () => {
    // data/v3.json: sec-tools holds 40 clauses.
    const inFolds = folded.flatMap((entry) => (entry.fold ? entry.items : []))

    expect(inFolds).toHaveLength(36)
    expect(tools.children).toHaveLength(40)
  })

  it('keeps the order of the list', () => {
    const order = folded.flatMap((entry) =>
      entry.fold ? entry.items.map((item) => item.node.id) : [entry.item.node.id],
    )

    expect(order).toEqual(tools.children.map((item) => item.node.id))
  })

  it('says in the label how many nodes a fold holds', () => {
    // data/v3.json: the edited clauses are numbers 22, 24, 26 and 32 of the 40 in sec-tools.
    // So the runs between them hold 21, 1, 1, 5 and 8 clauses.
    expect(folded.flatMap((entry) => (entry.fold ? [entry.label] : []))).toEqual([
      '21 unchanged clauses',
      '1 unchanged clause',
      '1 unchanged clause',
      '5 unchanged clauses',
      '8 unchanged clauses',
    ])
  })

  it('v2 to v3, top of the document: folds the one section with no change', () => {
    // docs/SPEC.md: each section but sec-intro and sec-leave holds a change in v2 to v3.
    const top = foldUnchanged(comparison.tree, counts)
    const folds = top.filter((entry) => entry.fold)

    expect(folds.map((entry) => entry.fold && entry.items.map((item) => item.node.id))).toEqual([
      ['sec-intro'],
      ['sec-leave'],
    ])
    expect(folds.map((entry) => entry.fold && entry.label)).toEqual([
      '1 unchanged section',
      '1 unchanged section',
    ])
  })

  it('v1 to v2: does not fold the marker of the clause that moved away', () => {
    const v1v2 = diffDocuments(v1, v2)
    const hours = find(v1v2.tree, 'sec-hours')!
    const entries = foldUnchanged(hours.children, changeCounts(v1v2.tree))

    expect(entries.some((entry) => !entry.fold && entry.item.kind === 'moved-away')).toBe(true)
  })
})

describe('foldUnchanged: nodes below an added or a removed node', () => {
  // docs/SPEC.md row 14: v2 adds sec-remote with 3 clauses. They are new, not unchanged.
  it('v1 to v2: does not fold the clauses of the added section sec-remote', () => {
    const comparison = diffDocuments(v1, v2)
    const remote = find(comparison.tree, 'sec-remote')!
    const entries = foldUnchanged(remote.children, changeCounts(comparison.tree))

    expect(remote.children).toHaveLength(3)
    expect(entries.filter((entry) => entry.fold)).toEqual([])
  })

  it('v1 to v3: does not fold the 4 clauses of sec-remote', () => {
    const comparison = diffDocuments(v1, v3)
    const remote = find(comparison.tree, 'sec-remote')!
    const entries = foldUnchanged(remote.children, changeCounts(comparison.tree))

    expect(remote.children).toHaveLength(4)
    expect(entries.filter((entry) => entry.fold)).toEqual([])
  })

  it('v1 to v2: keeps the removed clause cl-tool-trello out of a fold', () => {
    const comparison = diffDocuments(v1, v2)
    const tools = find(comparison.tree, 'sec-tools')!
    const entries = foldUnchanged(tools.children, changeCounts(comparison.tree))
    const folded = entries.flatMap((entry) => (entry.fold ? entry.items : []))

    expect(folded.map((item) => item.node.id)).not.toContain('cl-tool-trello')
    expect(folded.map((item) => item.node.id)).not.toContain('cl-tool-cursor')
  })
})

describe('describeChange: wording', () => {
  it('says that a formatting change is in format only', () => {
    const v1v2 = diffDocuments(v1, v2)
    const change = v1v2.changes.find((c) => c.nodeId === 'f-exp-equipment-limit')!

    expect(describeChange(v1v2, change).detail).toBe('Value changed in format only')
  })

  it('says the earlier name of a replaced clause', () => {
    const paired = pairReplaced(diffDocuments(v1, v2))
    const change = paired.changes.find((c) => c.nodeId === 'cl-sec-credentials')!

    expect(describeChange(paired, change).detail).toBe('Was Passwords')
  })
})
