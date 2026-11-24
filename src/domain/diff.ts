import { indexDocument, type DocumentIndex, type IndexEntry } from './indexTree'
import { lcsPairs } from './lcs'
import { isFormattingOnly } from './normalize'
import type { DocNode, HandbookDocument, NodeType } from './types'

export type ChangeKind = 'added' | 'removed' | 'edited' | 'moved' | 'reordered'

/** The part of a node that an edit changes. */
export type EditedPart = 'title' | 'label' | 'value' | 'text' | 'status'

export interface Edit {
  part: EditedPart
  /** undefined when the base version has no such part, for example no status. */
  before: string | undefined
  after: string | undefined
  /** True when only whitespace or the format of a number differs (D5). */
  formatting: boolean
}

interface ChangeOf<K extends ChangeKind> {
  kind: K
  /** The id in the target version. For a removed node, the id in the base version. */
  nodeId: string
  nodeType: NodeType
}

/** An added or removed node with children is one change, at its top node. */
export interface AddedChange extends ChangeOf<'added'> {
  /** The number of nodes in the subtree, the top node included. */
  size: number
}
export interface RemovedChange extends ChangeOf<'removed'> {
  size: number
}
export interface EditedChange extends ChangeOf<'edited'> {
  edits: Edit[]
  /** True when each edit of the node is a formatting change. */
  formatting: boolean
}

/** The node has the same id and another parent. It is one change, not a removal and an addition (D3). */
export interface MovedChange extends ChangeOf<'moved'> {
  /** null when the node was at the top of the document. */
  fromParentId: string | null
  toParentId: string | null
}
/** The node has the same parent and another place among the siblings that both versions share (D4). */
export type ReorderedChange = ChangeOf<'reordered'>

export type Change = AddedChange | RemovedChange | EditedChange | MovedChange | ReorderedChange

export interface Comparison {
  base: HandbookDocument
  target: HandbookDocument
  /** In document order: the order in which a reader meets them in the target version. */
  changes: Change[]
}

type Children = Map<string | null, DocNode[]>

function childrenByParent(document: HandbookDocument): Children {
  const result: Children = new Map([[null, document.children]])
  const visit = (nodes: readonly DocNode[]) => {
    for (const node of nodes) {
      if ('children' in node) {
        result.set(node.id, node.children)
        visit(node.children)
      }
    }
  }
  visit(document.children)
  return result
}

/**
 * The nodes of a subtree that the other version does not hold.
 * A node that the other version holds was not added or removed. It moved, and it is reported
 * where it is now, so the count stops there.
 */
function sizeOf(node: DocNode, other: DocumentIndex): number {
  if (other.byId.has(node.id)) return 0
  if (!('children' in node)) return 1
  return node.children.reduce((sum, child) => sum + sizeOf(child, other), 1)
}

function partsOf(node: DocNode): Array<[EditedPart, string | undefined]> {
  switch (node.type) {
    case 'section':
      return [['title', node.title]]
    case 'clause':
      return [
        ['title', node.title],
        ['status', node.status],
      ]
    case 'field':
      return [
        ['label', node.label],
        ['value', node.value],
      ]
    case 'paragraph':
      return [['text', node.text]]
  }
}

function editsBetween(base: DocNode, target: DocNode): Edit[] {
  const before = new Map(partsOf(base))
  const edits: Edit[] = []
  for (const [part, after] of partsOf(target)) {
    const earlier = before.get(part)
    if (earlier === after) continue
    const formatting =
      earlier !== undefined && after !== undefined && isFormattingOnly(earlier, after)
    edits.push({ part, before: earlier, after, formatting })
  }
  return edits
}

/**
 * Compares two versions of one document. Nodes match by id (D3).
 * The result is in document order, so a list of it reads from the top of the document down.
 */
export function diffDocuments(base: HandbookDocument, target: HandbookDocument): Comparison {
  const baseIndex: DocumentIndex = indexDocument(base)
  const targetIndex: DocumentIndex = indexDocument(target)
  const baseChildren = childrenByParent(base)
  const targetChildren = childrenByParent(target)
  const changes: Change[] = []

  // The fewest nodes that explain a new order: the siblings that both versions hold under one
  // parent, minus a longest run that kept its order. A swap of two neighbours gives one node.
  function reorderedIds(): Set<string> {
    const result = new Set<string>()
    for (const [parentId, children] of targetChildren) {
      const stayed = (index: DocumentIndex) => (node: DocNode) =>
        index.byId.get(node.id)?.parentId === parentId
      const before = (baseChildren.get(parentId) ?? []).filter(stayed(targetIndex))
      const after = children.filter(stayed(baseIndex))
      const kept = new Set(
        lcsPairs(
          before.map((node) => node.id),
          after.map((node) => node.id),
        ).map(([, j]) => j),
      )
      after.forEach((node, j) => {
        if (!kept.has(j)) result.add(node.id)
      })
    }
    return result
  }
  const reordered = reorderedIds()

  // The children of one node as a reader of the comparison sees them: the target children in
  // their order, and each removed child after the sibling that came before it in the base.
  function mergedChildren(parentId: string | null): Array<{ node: DocNode; removed: boolean }> {
    const merged = (targetChildren.get(parentId) ?? []).map((node) => ({ node, removed: false }))
    let insertAt = 0
    for (const child of baseChildren.get(parentId) ?? []) {
      const inTarget = merged.findIndex((item) => !item.removed && item.node.id === child.id)
      if (inTarget !== -1) {
        insertAt = inTarget + 1
      } else if (!targetIndex.byId.has(child.id)) {
        merged.splice(insertAt, 0, { node: child, removed: true })
        insertAt++
      }
    }
    return merged
  }

  function visitKept(node: DocNode, parentId: string | null, earlier: IndexEntry): void {
    const common = { nodeId: node.id, nodeType: node.type }
    if (earlier.parentId !== parentId) {
      changes.push({
        kind: 'moved',
        ...common,
        fromParentId: earlier.parentId,
        toParentId: parentId,
      })
    }
    if (reordered.has(node.id)) changes.push({ kind: 'reordered', ...common })
    const edits = editsBetween(earlier.node, node)
    if (edits.length > 0) {
      const formatting = edits.every((edit) => edit.formatting)
      changes.push({ kind: 'edited', ...common, edits, formatting })
    }
    if ('children' in node) visit(node.id)
  }

  // An added node is one change. A node below it that the base version holds moved into it:
  // that node gets its own changes, and the walk goes on from there.
  function visitAdded(node: DocNode): void {
    if (!('children' in node)) return
    for (const child of node.children) {
      const earlier = baseIndex.byId.get(child.id)
      if (earlier) visitKept(child, node.id, earlier)
      else visitAdded(child)
    }
  }

  function visit(parentId: string | null): void {
    for (const { node, removed } of mergedChildren(parentId)) {
      const common = { nodeId: node.id, nodeType: node.type }
      if (removed) {
        changes.push({ kind: 'removed', ...common, size: sizeOf(node, targetIndex) })
        continue
      }
      const earlier = baseIndex.byId.get(node.id)
      if (earlier) {
        visitKept(node, parentId, earlier)
      } else {
        changes.push({ kind: 'added', ...common, size: sizeOf(node, baseIndex) })
        visitAdded(node)
      }
    }
  }

  visit(null)
  return { base, target, changes }
}
