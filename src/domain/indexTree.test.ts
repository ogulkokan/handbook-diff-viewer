import { describe, expect, it } from 'vitest'

import { v1, v2, v3 } from './fixtures'
import { indexDocument } from './indexTree'
import { parseDocument } from './parseDocument'

describe('indexDocument', () => {
  // Counted from the files: v1 holds 8 sections, 64 clauses, 95 fields and 19 paragraphs.
  it('finds each node of the three versions', () => {
    expect(indexDocument(v1).byId.size).toBe(186)
    expect(indexDocument(v2).byId.size).toBe(193)
    expect(indexDocument(v3).byId.size).toBe(194)
  })

  it('knows the parent, the place and the depth of a nested section', () => {
    const index = indexDocument(v1)

    expect(index.byId.get('sec-travel')).toMatchObject({ parentId: 'sec-expenses', depth: 1 })
    expect(index.byId.get('sec-intro')).toMatchObject({ parentId: null, position: 0, depth: 0 })
    expect(index.byId.get('cl-intro-scope')).toMatchObject({ parentId: 'sec-intro', position: 1 })
  })

  it('lists a parent before its children, in display order', () => {
    const { order } = indexDocument(v1)

    expect(order.slice(0, 4)).toEqual([
      'sec-intro',
      'cl-intro-purpose',
      'p-intro-purpose-1',
      'cl-intro-scope',
    ])
  })

  it('rejects a document that uses one id twice', () => {
    const document = parseDocument({
      id: 'doc',
      version: 1,
      title: 'T',
      updatedAt: '2026-01-01',
      children: [
        { id: 'sec-a', type: 'section', title: 'A', children: [] },
        { id: 'sec-a', type: 'section', title: 'B', children: [] },
      ],
    })

    expect(() => indexDocument(document)).toThrow('node "sec-a": the id is used more than once')
  })
})
