import {
  editsBetween,
  type Comparison,
  type EditedChange,
  type ReplacedChange,
  type ViewItem,
  type ViewNode,
} from './diff'
import { parseInline } from './inline'
import { lcsPairs } from './lcs'
import { wordsOf } from './textDiff'
import type { DocNode } from './types'
import { changesIn } from './view'

/** Two nodes pair when this share of the words of their leaves is the same, in the same order. */
const ALIKE = 0.8

/**
 * Below this number of words on a side, the measure says nothing. Two tools that both hold
 * "Atlassian" and "Approved" are 100% alike and are still two tools.
 */
const MIN_WORDS = 10

const NOT_SPACE = /\S/

// The words that a reader reads in a node: field values and paragraph text.
// Titles and labels are left out: two tools with the labels "Vendor" and "Status" are not alike.
function contentWords(node: DocNode): string[] {
  if (node.type === 'field') return wordsOf(node.value).filter((word) => NOT_SPACE.test(word))
  if (node.type === 'paragraph') {
    const text = parseInline(node.text)
      .map((token) => token.text)
      .join('')
    return wordsOf(text).filter((word) => NOT_SPACE.test(word))
  }
  return node.children.flatMap(contentWords)
}

/** From 0 to 1: how much of the content of two nodes is the same. 0 when a node has too little content. */
export function likeness(a: DocNode, b: DocNode): number {
  const wordsA = contentWords(a)
  const wordsB = contentWords(b)
  if (wordsA.length < MIN_WORDS || wordsB.length < MIN_WORDS) return 0
  return (2 * lcsPairs(wordsA, wordsB).length) / (wordsA.length + wordsB.length)
}

function sizeOf(item: ViewNode): number {
  return item.children.reduce((sum, child) => sum + (child.kind === 'node' ? sizeOf(child) : 0), 1)
}

function withOwnChange(item: ViewNode, kind: 'added' | 'removed'): ViewNode {
  if (item.changes.length > 0) return item
  const change = { kind, nodeId: item.node.id, nodeType: item.node.type, size: sizeOf(item) }
  return { ...item, changes: [change] }
}

// The nodes below a pair, matched by type and order. A matched node shows what differs.
function pairChildren(
  removed: readonly ViewItem[],
  added: readonly ViewItem[],
  pairId: string,
): ViewItem[] {
  const unused = removed.filter((item): item is ViewNode => item.kind === 'node')
  const result: ViewItem[] = added.map((item) => {
    if (item.kind !== 'node') return item
    const index = unused.findIndex((candidate) => candidate.node.type === item.node.type)
    // No node to match: this one is new inside the pair. It gets its own change, so that it
    // has a badge and a place in the change list, not only a colour.
    if (index === -1) return withOwnChange(item, 'added')
    const [earlier] = unused.splice(index, 1)
    const edits = editsBetween(earlier!.node, item.node)
    const changes: EditedChange[] =
      edits.length === 0
        ? []
        : [
            {
              kind: 'edited',
              nodeId: item.node.id,
              nodeType: item.node.type,
              edits,
              formatting: edits.every((edit) => edit.formatting),
              partOf: pairId,
            },
          ]
    return {
      kind: 'node',
      node: item.node,
      presence: 'both',
      changes,
      children: pairChildren(earlier!.children, item.children, pairId),
    }
  })
  // A node of the earlier version with no partner stays, as removed, after the others.
  return [...result, ...unused.map((item) => withOwnChange(item, 'removed'))]
}

function pairList(items: readonly ViewItem[]): ViewItem[] {
  // Only a section or a clause can pair. A lone field or paragraph has too little content
  // for the measure: two fields with the value "Approved" would be 100% alike.
  const isTop = (item: ViewItem, presence: ViewNode['presence']): item is ViewNode =>
    item.kind === 'node' &&
    item.presence === presence &&
    item.changes.length > 0 &&
    (item.node.type === 'section' || item.node.type === 'clause')
  const removed = items.filter((item) => isTop(item, 'removed'))
  const partnerOf = new Map<ViewItem, ViewNode>()
  const paired = new Set<ViewItem>()

  for (const earlier of removed) {
    let best: ViewNode | undefined
    let bestScore = ALIKE
    for (const item of items) {
      if (!isTop(item, 'added') || partnerOf.has(item)) continue
      if (item.node.type !== earlier.node.type) continue
      const score = likeness(earlier.node, item.node)
      if (score >= bestScore) {
        best = item
        bestScore = score
      }
    }
    if (best) {
      partnerOf.set(best, earlier)
      paired.add(earlier)
    }
  }

  return items.flatMap((item): ViewItem[] => {
    if (paired.has(item)) return []
    if (item.kind !== 'node') return [item]
    const earlier = partnerOf.get(item)
    if (!earlier) return [{ ...item, children: pairList(item.children) }]
    const change: ReplacedChange = {
      kind: 'replaced',
      nodeId: item.node.id,
      nodeType: item.node.type,
      fromNodeId: earlier.node.id,
      edits: editsBetween(earlier.node, item.node),
    }
    return [
      {
        kind: 'node',
        node: item.node,
        presence: 'both',
        changes: [change],
        children: pairChildren(earlier.children, item.children, item.node.id),
      },
    ]
  })
}

/**
 * Joins a removed node and an added node into one "replaced" change when they have the same
 * parent and type and their content is at least 80% alike (D6). The pair stands at the place of
 * the added node, and the removed node leaves the view.
 */
export function pairReplaced(comparison: Comparison): Comparison {
  const tree = pairList(comparison.tree)
  return { ...comparison, tree, changes: changesIn(tree) }
}
