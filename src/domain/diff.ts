import { indexDocument, type DocumentIndex, type IndexEntry } from './indexTree'
import { lcsPairs } from './lcs'
import { isFormattingOnly } from './normalize'
import { diffInline, parseInline, type InlinePart } from './inline'
import type { DocNode, HandbookDocument, NodeType } from './types'

export type ChangeKind = 'added' | 'removed' | 'edited' | 'moved' | 'reordered' | 'replaced'

/** The part of a node that an edit changes. */
export type EditedPart = 'title' | 'label' | 'value' | 'text' | 'status'

export interface Edit {
  part: EditedPart
  /** undefined when the base version has no such part, for example no status. */
  before: string | undefined
  after: string | undefined
  /** True when only whitespace or the format of a number differs (D5). */
  formatting: boolean
  /** For the text of a paragraph that is in both versions: the words that differ, as tokens. */
  parts?: InlinePart[]
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
  /**
   * The id of a replaced node that this edit is inside. Such an edit shows what differs inside
   * the pair. It is part of that one change and is not counted on its own.
   */
  partOf?: string
}

/** The node has the same id and another parent. It is one change, not a removal and an addition (D3). */
export interface MovedChange extends ChangeOf<'moved'> {
  /** null when the node was at the top of the document. */
  fromParentId: string | null
  toParentId: string | null
}
/** The node has the same parent and another place among the siblings that both versions share (D4). */
export type ReorderedChange = ChangeOf<'reordered'>

/**
 * A removed node and an added node that are probably the same thing under a new id (D6).
 * The schema says that a new id is a new node, so this is a guess, and the UI says "likely".
 */
export interface ReplacedChange extends ChangeOf<'replaced'> {
  /** The id of the node in the base version. */
  fromNodeId: string
  /** What differs between the two nodes themselves, for example the title. */
  edits: Edit[]
}

export type Change =
  AddedChange | RemovedChange | EditedChange | MovedChange | ReorderedChange | ReplacedChange

/** One node as the reader of a comparison sees it. */
export interface ViewNode {
  kind: 'node'
  node: DocNode
  /**
   * "both": the node is in the two versions. "added" and "removed" also hold for each node
   * below an added or removed top node, which has no change of its own.
   */
  presence: 'both' | 'added' | 'removed'
  /** The changes of this node itself, not of the nodes below it. */
  changes: Change[]
  children: ViewItem[]
}

/** Stands at the earlier place of a node that moved to another parent. */
export interface MovedAwayMarker {
  kind: 'moved-away'
  node: DocNode
  toParentId: string | null
}

export type ViewItem = ViewNode | MovedAwayMarker

export interface Comparison {
  base: HandbookDocument
  target: HandbookDocument
  baseIndex: DocumentIndex
  targetIndex: DocumentIndex
  /** In document order: the order in which a reader meets them in the target version. */
  changes: Change[]
  /**
   * The target version with the removed nodes put back at their earlier place (D1).
   * A walk of this tree meets the changes in the order of "changes".
   */
  tree: ViewItem[]
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

/** What differs between two nodes themselves: title, label, value, text or status. */
export function editsBetween(base: DocNode, target: DocNode): Edit[] {
  const before = new Map(partsOf(base))
  const edits: Edit[] = []
  for (const [part, after] of partsOf(target)) {
    const earlier = before.get(part)
    if (earlier === after) continue
    const formatting =
      earlier !== undefined && after !== undefined && isFormattingOnly(earlier, after)
    const edit: Edit = { part, before: earlier, after, formatting }
    if (part === 'text' && earlier !== undefined && after !== undefined) {
      edit.parts = diffInline(parseInline(earlier), parseInline(after))
    }
    edits.push(edit)
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

  type Place = 'target' | 'removed' | 'moved-away'

  // The children of one node as a reader of the comparison sees them: the target children in
  // their order, and each base child that is gone from here after the sibling that came before it.
  function mergedChildren(parentId: string | null): Array<{ node: DocNode; place: Place }> {
    const merged: Array<{ node: DocNode; place: Place }> = (targetChildren.get(parentId) ?? []).map(
      (node) => ({ node, place: 'target' }),
    )
    let insertAt = 0
    for (const child of baseChildren.get(parentId) ?? []) {
      const inTarget = merged.findIndex(
        (item) => item.place === 'target' && item.node.id === child.id,
      )
      if (inTarget !== -1) {
        insertAt = inTarget + 1
        continue
      }
      const place = targetIndex.byId.has(child.id) ? 'moved-away' : 'removed'
      merged.splice(insertAt, 0, { node: child, place })
      insertAt++
    }
    return merged
  }

  function movedAway(node: DocNode): MovedAwayMarker {
    return {
      kind: 'moved-away',
      node,
      toParentId: targetIndex.byId.get(node.id)?.parentId ?? null,
    }
  }

  function keptNode(node: DocNode, parentId: string | null, earlier: IndexEntry): ViewNode {
    const common = { nodeId: node.id, nodeType: node.type }
    const own: Change[] = []
    if (earlier.parentId !== parentId) {
      own.push({ kind: 'moved', ...common, fromParentId: earlier.parentId, toParentId: parentId })
    }
    if (reordered.has(node.id)) own.push({ kind: 'reordered', ...common })
    const edits = editsBetween(earlier.node, node)
    if (edits.length > 0) {
      const formatting = edits.every((edit) => edit.formatting)
      own.push({ kind: 'edited', ...common, edits, formatting })
    }
    // The changes of a node come before the changes of its children: document order.
    changes.push(...own)
    const children = 'children' in node ? visit(node.id) : []
    return { kind: 'node', node, presence: 'both', changes: own, children }
  }

  // An added node is one change, at its top node. A node below it that the base version holds
  // moved into it: that node gets its own changes, and the walk goes on from there.
  function addedNode(node: DocNode, isTop: boolean): ViewNode {
    const own: Change[] = []
    if (isTop) {
      own.push({
        kind: 'added',
        nodeId: node.id,
        nodeType: node.type,
        size: sizeOf(node, baseIndex),
      })
      changes.push(...own)
    }
    const children = !('children' in node)
      ? []
      : node.children.map((child) => {
          const earlier = baseIndex.byId.get(child.id)
          return earlier ? keptNode(child, node.id, earlier) : addedNode(child, false)
        })
    return { kind: 'node', node, presence: 'added', changes: own, children }
  }

  // A removed node is one change, at its top node. A node below it that the target version
  // holds moved out: a marker stands at its earlier place.
  function removedNode(node: DocNode, isTop: boolean): ViewNode {
    const own: Change[] = []
    if (isTop) {
      own.push({
        kind: 'removed',
        nodeId: node.id,
        nodeType: node.type,
        size: sizeOf(node, targetIndex),
      })
      changes.push(...own)
    }
    const children = !('children' in node)
      ? []
      : node.children.map((child) =>
          targetIndex.byId.has(child.id) ? movedAway(child) : removedNode(child, false),
        )
    return { kind: 'node', node, presence: 'removed', changes: own, children }
  }

  function visit(parentId: string | null): ViewItem[] {
    return mergedChildren(parentId).map(({ node, place }) => {
      if (place === 'moved-away') return movedAway(node)
      if (place === 'removed') return removedNode(node, true)
      const earlier = baseIndex.byId.get(node.id)
      return earlier ? keptNode(node, parentId, earlier) : addedNode(node, true)
    })
  }

  const tree = visit(null)
  return { base, target, baseIndex, targetIndex, changes, tree }
}
