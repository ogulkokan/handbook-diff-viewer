import { describe, expect, it } from 'vitest'

import { v1, v2, v3 } from './fixtures'
import { DocumentShapeError, parseDocument } from './parseDocument'

// Expected values: counted by hand from data/v1.json, v2.json and v3.json.
const TOP_SECTIONS_V1 = [
  'sec-intro',
  'sec-hours',
  'sec-leave',
  'sec-expenses',
  'sec-security',
  'sec-tools',
  'sec-comms',
]

describe('parseDocument', () => {
  it('loads version 1 with its 7 top sections in display order', () => {
    expect(v1.version).toBe(1)
    expect(v1.children.map((node) => node.id)).toEqual(TOP_SECTIONS_V1)
  })

  it('loads versions 2 and 3 with the added section sec-remote at the end', () => {
    for (const document of [v2, v3]) {
      expect(document.children.map((node) => node.id)).toEqual([...TOP_SECTIONS_V1, 'sec-remote'])
    }
    expect(v2.version).toBe(2)
    expect(v3.version).toBe(3)
  })

  it('keeps the optional status of a clause', () => {
    const remote = v3.children.find((node) => node.id === 'sec-remote')
    const coworking = remote?.children.find((node) => node.id === 'cl-remote-coworking')

    expect(coworking).toMatchObject({ type: 'clause', status: 'draft' })
  })

  it('rejects a clause that holds a section, and names the node', () => {
    const raw = {
      id: 'doc',
      version: 1,
      title: 'T',
      updatedAt: '2026-01-01',
      children: [
        {
          id: 'sec-a',
          type: 'section',
          title: 'A',
          children: [
            {
              id: 'cl-a',
              type: 'clause',
              title: 'Clause',
              children: [{ id: 'sec-wrong', type: 'section', title: 'W', children: [] }],
            },
          ],
        },
      ],
    }

    expect(() => parseDocument(raw)).toThrow(DocumentShapeError)
    expect(() => parseDocument(raw)).toThrow(
      'node "sec-wrong": the type is "section", expected field or paragraph',
    )
  })

  it('rejects a field with no value, and names the node', () => {
    const raw = {
      id: 'doc',
      version: 1,
      title: 'T',
      updatedAt: '2026-01-01',
      children: [
        {
          id: 'sec-a',
          type: 'section',
          title: 'A',
          children: [
            {
              id: 'cl-a',
              type: 'clause',
              title: 'C',
              children: [{ id: 'f-a', type: 'field', label: 'L' }],
            },
          ],
        },
      ],
    }

    expect(() => parseDocument(raw)).toThrow('node "f-a": "value" must be a string')
  })

  it('rejects a node with no id, and says where it is', () => {
    const raw = {
      id: 'doc',
      version: 1,
      title: 'T',
      updatedAt: '2026-01-01',
      children: [{ type: 'section', title: 'A', children: [] }],
    }

    expect(() => parseDocument(raw)).toThrow('document "doc", child 1: a node must have an "id"')
  })
})
