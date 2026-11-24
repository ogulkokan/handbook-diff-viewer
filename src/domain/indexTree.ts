import { DocumentShapeError } from './parseDocument'
import type { DocNode, HandbookDocument } from './types'

export interface IndexEntry {
  node: DocNode
  /** null for a node at the top of the document. */
  parentId: string | null
  /** The place among its siblings, from 0. */
  position: number
  /** 0 for a node at the top of the document. */
  depth: number
}

export interface DocumentIndex {
  byId: ReadonlyMap<string, IndexEntry>
  /** All ids in display order: a parent comes before its children. */
  order: readonly string[]
}

/** Makes each node of a document reachable by its id. Throws on an id that is used twice. */
export function indexDocument(document: HandbookDocument): DocumentIndex {
  const byId = new Map<string, IndexEntry>()
  const order: string[] = []

  function visit(nodes: readonly DocNode[], parentId: string | null, depth: number): void {
    nodes.forEach((node, position) => {
      if (byId.has(node.id)) {
        throw new DocumentShapeError(`node "${node.id}"`, 'the id is used more than once')
      }
      byId.set(node.id, { node, parentId, position, depth })
      order.push(node.id)
      if ('children' in node) visit(node.children, node.id, depth + 1)
    })
  }

  visit(document.children, null, 0)
  return { byId, order }
}
