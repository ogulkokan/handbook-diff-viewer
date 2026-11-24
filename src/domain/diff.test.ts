import { describe, expect, it } from 'vitest'

import { diffDocuments, type Change, type ChangeKind } from './diff'
import { v1, v2, v3 } from './fixtures'
import { indexDocument } from './indexTree'

// Every expected id below comes from "Expected changes" in docs/SPEC.md,
// which was counted by hand from the three data files.

function idsOf(changes: readonly Change[], kind: ChangeKind): string[] {
  return changes.filter((change) => change.kind === kind).map((change) => change.nodeId)
}

function edited(changes: readonly Change[], formatting: boolean): string[] {
  return changes
    .filter((change) => change.kind === 'edited' && change.formatting === formatting)
    .map((change) => change.nodeId)
    .sort()
}

function one(changes: readonly Change[], nodeId: string, kind: ChangeKind): Change {
  const found = changes.filter((change) => change.nodeId === nodeId && change.kind === kind)
  expect(found).toHaveLength(1)
  return found[0]!
}

describe('diffDocuments: added and removed', () => {
  it('v1 to v2: reports each added subtree once, at its top node', () => {
    const changes = diffDocuments(v1, v2).changes

    expect(idsOf(changes, 'added').sort()).toEqual([
      'cl-sec-credentials',
      'cl-tool-cursor',
      'sec-remote',
    ])
    // 2 + 3 + 7 nodes: the 12 added nodes of v2.
    expect(one(changes, 'cl-sec-credentials', 'added')).toMatchObject({ size: 2 })
    expect(one(changes, 'cl-tool-cursor', 'added')).toMatchObject({ size: 3 })
    expect(one(changes, 'sec-remote', 'added')).toMatchObject({ size: 7 })
  })

  it('v1 to v2: reports each removed subtree once, at its top node', () => {
    const changes = diffDocuments(v1, v2).changes

    expect(idsOf(changes, 'removed').sort()).toEqual(['cl-sec-passwords', 'cl-tool-trello'])
    // 2 + 3 nodes: the 5 removed nodes of v1.
    expect(one(changes, 'cl-sec-passwords', 'removed')).toMatchObject({ size: 2 })
    expect(one(changes, 'cl-tool-trello', 'removed')).toMatchObject({ size: 3 })
  })

  it('v2 to v3: one added clause with its paragraph, one removed field', () => {
    const changes = diffDocuments(v2, v3).changes

    expect(idsOf(changes, 'added')).toEqual(['cl-remote-coworking'])
    expect(one(changes, 'cl-remote-coworking', 'added')).toMatchObject({ size: 2 })
    expect(idsOf(changes, 'removed')).toEqual(['f-sec-access-cadence'])
    expect(one(changes, 'f-sec-access-cadence', 'removed')).toMatchObject({ size: 1 })
  })
})

describe('diffDocuments: edited', () => {
  it('v1 to v2: the 5 real edits', () => {
    expect(edited(diffDocuments(v1, v2).changes, false)).toEqual([
      'f-hours-overtime-max',
      'f-intro-reviewed',
      'f-leave-annual-days',
      'f-tool-chatgpt-status',
      'f-travel-hotel-limit',
    ])
  })

  it('v2 to v3: the 8 real edits', () => {
    expect(edited(diffDocuments(v2, v3).changes, false)).toEqual([
      'f-comms-response',
      'f-tool-claude-vendor',
      'f-tool-dropbox-status',
      'f-tool-grammarly-status',
      'f-tool-zapier-status',
      'p-exp-reimbursement-1',
      'p-travel-flights-1',
      'sec-hours',
    ])
  })

  it('says which part of the node differs, with the earlier and the current text', () => {
    const v1v2 = diffDocuments(v1, v2).changes
    const v2v3 = diffDocuments(v2, v3).changes

    // A label that changes while the value stays.
    expect(one(v1v2, 'f-hours-overtime-max', 'edited')).toMatchObject({
      edits: [
        {
          part: 'label',
          before: 'Max weekly overtime',
          after: 'Maximum weekly overtime (hours)',
        },
      ],
    })
    expect(one(v1v2, 'f-leave-annual-days', 'edited')).toMatchObject({
      edits: [{ part: 'value', before: '25', after: '27' }],
    })
    expect(one(v2v3, 'sec-hours', 'edited')).toMatchObject({
      edits: [{ part: 'title', before: 'Working Hours', after: 'Working Time' }],
    })
  })

  it('reports nothing for a node that is equal in both versions', () => {
    const changes = diffDocuments(v1, v2).changes

    expect(changes.filter((change) => change.nodeId === 'p-intro-purpose-1')).toEqual([])
  })

  it('reports no change at all for a version against itself', () => {
    expect(diffDocuments(v2, v2).changes).toEqual([])
  })
})

describe('diffDocuments: formatting changes (D5)', () => {
  it('v1 to v2: an edit of whitespace only is a formatting change', () => {
    const change = one(diffDocuments(v1, v2).changes, 'p-leave-sick-1', 'edited')

    expect(change).toMatchObject({ formatting: true })
  })

  it('v1 to v2: 1,000 EUR against 1000 EUR is a formatting change', () => {
    const change = one(diffDocuments(v1, v2).changes, 'f-exp-equipment-limit', 'edited')

    expect(change).toMatchObject({
      formatting: true,
      edits: [{ part: 'value', before: '1,000 EUR', after: '1000 EUR' }],
    })
  })

  it('v1 to v2: 150 EUR against 170 EUR is a real edit', () => {
    const change = one(diffDocuments(v1, v2).changes, 'f-travel-hotel-limit', 'edited')

    expect(change).toMatchObject({ formatting: false })
  })

  it('v1 to v2: a date in a new format with a new day is a real edit', () => {
    const change = one(diffDocuments(v1, v2).changes, 'f-intro-reviewed', 'edited')

    expect(change).toMatchObject({
      formatting: false,
      edits: [{ part: 'value', before: '2026-01-15', after: '02.04.2026' }],
    })
  })

  it('the two formatting changes of v1 to v2 are the only ones, and v2 to v3 has none', () => {
    expect(edited(diffDocuments(v1, v2).changes, true)).toEqual([
      'f-exp-equipment-limit',
      'p-leave-sick-1',
    ])
    expect(edited(diffDocuments(v2, v3).changes, true)).toEqual([])
  })
})

describe('diffDocuments: moved (D3)', () => {
  it('v1 to v2: a clause under a new parent is one moved change', () => {
    const changes = diffDocuments(v1, v2).changes

    expect(idsOf(changes, 'moved')).toEqual(['cl-hours-holidays'])
    expect(one(changes, 'cl-hours-holidays', 'moved')).toMatchObject({
      fromParentId: 'sec-hours',
      toParentId: 'sec-leave',
    })
  })

  it('v1 to v2: the moved clause and its children are not added, removed or edited', () => {
    const changes = diffDocuments(v1, v2).changes
    const index = indexDocument(v1)
    const family = index.order.filter(
      (id) => id === 'cl-hours-holidays' || index.byId.get(id)?.parentId === 'cl-hours-holidays',
    )

    // The clause holds at least one child in the data, so the check is not empty.
    expect(family.length).toBeGreaterThan(1)
    const kinds = changes.filter((change) => family.includes(change.nodeId)).map((c) => c.kind)
    expect(kinds).toEqual(['moved'])
  })

  it('v2 to v3: nothing moved', () => {
    expect(idsOf(diffDocuments(v2, v3).changes, 'moved')).toEqual([])
  })
})

describe('diffDocuments: reordered (D4)', () => {
  it('v1 to v2: a swap of two clauses marks one node, not two', () => {
    const reordered = idsOf(diffDocuments(v1, v2).changes, 'reordered')

    expect(reordered).toHaveLength(1)
    expect(['cl-comms-channels', 'cl-comms-meetings']).toContain(reordered[0])
  })

  it('v1 to v2: an added or removed sibling does not mark the nodes after it', () => {
    // sec-tools loses cl-tool-trello and gains cl-tool-cursor. Its other 39 clauses keep their order.
    const changes = diffDocuments(v1, v2).changes
    const tools = indexDocument(v2)
    const inTools = idsOf(changes, 'reordered').filter(
      (id) => tools.byId.get(id)?.parentId === 'sec-tools',
    )

    expect(inTools).toEqual([])
  })

  it('v1 to v2: the node that moved away does not mark its earlier siblings', () => {
    const hours = indexDocument(v2)
    const inHours = idsOf(diffDocuments(v1, v2).changes, 'reordered').filter(
      (id) => hours.byId.get(id)?.parentId === 'sec-hours',
    )

    expect(inHours).toEqual([])
  })

  it('v2 to v3: nothing reordered', () => {
    expect(idsOf(diffDocuments(v2, v3).changes, 'reordered')).toEqual([])
  })
})

describe('diffDocuments: any two versions (D2)', () => {
  it('v1 to v3: the changes of both steps', () => {
    const changes = diffDocuments(v1, v3).changes

    expect(idsOf(changes, 'added').sort()).toEqual([
      'cl-sec-credentials',
      'cl-tool-cursor',
      'sec-remote',
    ])
    // sec-remote now holds the clause that v3 added: 7 + 2 nodes.
    expect(one(changes, 'sec-remote', 'added')).toMatchObject({ size: 9 })
    expect(idsOf(changes, 'removed').sort()).toEqual([
      'cl-sec-passwords',
      'cl-tool-trello',
      'f-sec-access-cadence',
    ])
    expect(idsOf(changes, 'moved')).toEqual(['cl-hours-holidays'])
    expect(idsOf(changes, 'reordered')).toHaveLength(1)
    expect(edited(changes, true)).toEqual(['f-exp-equipment-limit', 'p-leave-sick-1'])
    // The 5 real edits of v1 to v2 and the 8 of v2 to v3.
    expect(edited(changes, false)).toHaveLength(13)
  })
})

describe('diffDocuments: document order', () => {
  it('v2 to v3: lists the changes in the order of the target version', () => {
    const changes = diffDocuments(v2, v3).changes
    const order = indexDocument(v3).order
    const inTarget = changes.filter((change) => change.kind !== 'removed').map((c) => c.nodeId)

    expect(inTarget).toEqual([...inTarget].sort((a, b) => order.indexOf(a) - order.indexOf(b)))
  })

  it('v2 to v3: puts a removed field where it was, between its neighbours', () => {
    const ids = diffDocuments(v2, v3).changes.map((change) => change.nodeId)

    // sec-security comes after sec-expenses and before sec-tools.
    expect(ids.indexOf('f-sec-access-cadence')).toBeGreaterThan(
      ids.indexOf('p-exp-reimbursement-1'),
    )
    expect(ids.indexOf('f-sec-access-cadence')).toBeLessThan(ids.indexOf('f-tool-grammarly-status'))
  })
})

describe('diffDocuments: totals that the reader sees', () => {
  const visible = (changes: readonly Change[]) =>
    changes.filter((change) => !(change.kind === 'edited' && change.formatting))

  it('v1 to v2: 12 changes and 2 formatting changes', () => {
    // docs/SPEC.md: 3 added, 2 removed, 1 moved, 1 reordered, 5 edited. And 2 formatting.
    const changes = diffDocuments(v1, v2).changes

    expect(visible(changes)).toHaveLength(12)
    expect(changes).toHaveLength(14)
  })

  it('v2 to v3: 10 changes and no formatting change', () => {
    // docs/SPEC.md: 1 added, 1 removed, 8 edited.
    const changes = diffDocuments(v2, v3).changes

    expect(visible(changes)).toHaveLength(10)
    expect(changes).toHaveLength(10)
  })
})
