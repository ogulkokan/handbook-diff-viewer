import type {
  ClauseNode,
  DocNode,
  HandbookDocument,
  LeafNode,
  NodeType,
  SectionNode,
} from './types'

/** A data file does not have the shape that data/README.md describes. */
export class DocumentShapeError extends Error {
  constructor(
    readonly where: string,
    problem: string,
  ) {
    super(`${where}: ${problem}`)
    this.name = 'DocumentShapeError'
  }
}

type Raw = Record<string, unknown>

const SECTION_CHILDREN = ['section', 'clause'] as const
const CLAUSE_CHILDREN = ['field', 'paragraph'] as const

function isRaw(value: unknown): value is Raw {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function text(raw: Raw, key: string, where: string): string {
  const value = raw[key]
  if (typeof value !== 'string') {
    throw new DocumentShapeError(where, `"${key}" must be a string`)
  }
  return value
}

function children<T extends DocNode>(raw: Raw, where: string, allowed: readonly NodeType[]): T[] {
  const list = raw.children
  if (!Array.isArray(list)) {
    throw new DocumentShapeError(where, '"children" must be a list')
  }
  return list.map((child, index) => node(child, `${where}, child ${index + 1}`, allowed) as T)
}

function node(raw: unknown, fallbackWhere: string, allowed: readonly NodeType[]): DocNode {
  if (!isRaw(raw)) {
    throw new DocumentShapeError(fallbackWhere, 'a node must be an object')
  }
  if (typeof raw.id !== 'string' || raw.id === '') {
    throw new DocumentShapeError(fallbackWhere, 'a node must have an "id"')
  }
  const id = raw.id
  const where = `node "${id}"`
  const type = allowed.find((candidate) => candidate === raw.type)
  if (type === undefined) {
    const found = JSON.stringify(raw.type)
    throw new DocumentShapeError(where, `the type is ${found}, expected ${allowed.join(' or ')}`)
  }

  switch (type) {
    case 'section':
      return {
        id,
        type,
        title: text(raw, 'title', where),
        children: children<SectionNode | ClauseNode>(raw, where, SECTION_CHILDREN),
      }
    case 'clause': {
      const clause: ClauseNode = {
        id,
        type,
        title: text(raw, 'title', where),
        children: children<LeafNode>(raw, where, CLAUSE_CHILDREN),
      }
      if (raw.status !== undefined) clause.status = text(raw, 'status', where)
      return clause
    }
    case 'field':
      return { id, type, label: text(raw, 'label', where), value: text(raw, 'value', where) }
    case 'paragraph':
      return { id, type, text: text(raw, 'text', where) }
  }
}

/**
 * Checks one data file and returns it as a typed document.
 * Throws DocumentShapeError with the id of the first node that is wrong.
 */
export function parseDocument(raw: unknown): HandbookDocument {
  if (!isRaw(raw)) {
    throw new DocumentShapeError('document', 'a document must be an object')
  }
  const where = `document ${JSON.stringify(raw.id)}`
  if (typeof raw.version !== 'number' || !Number.isInteger(raw.version)) {
    throw new DocumentShapeError(where, '"version" must be a whole number')
  }
  return {
    id: text(raw, 'id', where),
    version: raw.version,
    title: text(raw, 'title', where),
    updatedAt: text(raw, 'updatedAt', where),
    children: children<SectionNode | ClauseNode>(raw, where, SECTION_CHILDREN),
  }
}
