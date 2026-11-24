import type { Change, Comparison, Edit, ViewItem, ViewNode } from './diff'
import type { DocNode } from './types'

/** True for an edit that changes only whitespace or the format of a number (D5). */
export function isFormattingChange(change: Change): boolean {
  return change.kind === 'edited' && change.formatting
}

/** The same tree with the formatting changes taken away from each node. Nothing else differs. */
export function withoutFormattingChanges(tree: readonly ViewItem[]): ViewItem[] {
  return tree.map((item) =>
    item.kind === 'moved-away'
      ? item
      : {
          ...item,
          changes: item.changes.filter((change) => !isFormattingChange(change)),
          children: withoutFormattingChanges(item.children),
        },
  )
}

/** The changes of a list of items and of all nodes below them, in document order. */
export function changesIn(items: readonly ViewItem[]): Change[] {
  return items.flatMap((item) =>
    item.kind === 'moved-away'
      ? []
      : [...item.changes.filter(countsOnItsOwn), ...changesIn(item.children)],
  )
}

/** False for an edit inside a replaced node: it is part of that one change. */
function countsOnItsOwn(change: Change): boolean {
  return !(change.kind === 'edited' && change.partOf !== undefined)
}

/** For each node that holds a change itself or below it: the number of those changes. */
export function changeCounts(tree: readonly ViewItem[]): Map<string, number> {
  const counts = new Map<string, number>()
  const visit = (items: readonly ViewItem[]): number =>
    items.reduce((sum, item) => {
      if (item.kind === 'moved-away') return sum
      const count = item.changes.filter(countsOnItsOwn).length + visit(item.children)
      if (count > 0) counts.set(item.node.id, count)
      return sum + count
    }, 0)
  visit(tree)
  return counts
}

/** The name of a node for a reader: a title, a label, or "Paragraph". */
export function nameOf(node: DocNode): string {
  switch (node.type) {
    case 'section':
    case 'clause':
      return node.title
    case 'field':
      return node.label
    case 'paragraph':
      return 'Paragraph'
  }
}

/**
 * The name of a changed node and the name of the node that holds it, for the change list.
 * A removed node is looked up in the base version, each other node in the target version.
 */
export function describeChange(
  comparison: Comparison,
  change: Change,
): { name: string; context: string | null } {
  const index = change.kind === 'removed' ? comparison.baseIndex : comparison.targetIndex
  const entry = index.byId.get(change.nodeId)
  if (!entry) return { name: change.nodeId, context: null }
  const parent = entry.parentId === null ? undefined : index.byId.get(entry.parentId)
  return { name: nameOf(entry.node), context: parent ? nameOf(parent.node) : null }
}

/** The edit of one part of a node, when its changes hold one. */
export function editOf(changes: readonly Change[], part: Edit['part']): Edit | undefined {
  for (const change of changes) {
    if (change.kind !== 'edited' && change.kind !== 'replaced') continue
    const edit = change.edits.find((candidate) => candidate.part === part)
    if (edit) return edit
  }
  return undefined
}

/** One item of a list as "Changes only" shows it: a node on its own, or a run of unchanged nodes. */
export type Folded =
  { fold: false; item: ViewItem } | { fold: true; key: string; items: ViewNode[]; label: string }

// A list holds sections and clauses. Fields and paragraphs are never folded on their own.
function runLabel(items: readonly ViewNode[]): string {
  const count = (type: DocNode['type'], one: string, many: string) => {
    const n = items.filter((item) => item.node.type === type).length
    return n === 0 ? [] : [`${n} unchanged ${n === 1 ? one : many}`]
  }
  return [...count('section', 'section', 'sections'), ...count('clause', 'clause', 'clauses')].join(
    ' and ',
  )
}

/**
 * Groups each run of neighbours that hold no change, themselves or below them, into one fold (D10).
 * A node with a change, a node that is added or removed, and a moved-away marker stay on their
 * own, in their place.
 * `counts` is the result of changeCounts for the same tree.
 */
export function foldUnchanged(
  items: readonly ViewItem[],
  counts: ReadonlyMap<string, number>,
): Folded[] {
  const result: Folded[] = []
  for (const item of items) {
    // "Unchanged" means: in both versions, and no change at the node or below it.
    // A node below an added or a removed node has no change of its own, but it is not unchanged.
    if (item.kind === 'moved-away' || item.presence !== 'both' || counts.has(item.node.id)) {
      result.push({ fold: false, item })
      continue
    }
    const last = result.at(-1)
    if (last?.fold) {
      last.items.push(item)
      last.label = runLabel(last.items)
    } else {
      result.push({
        fold: true,
        key: `fold-${item.node.id}`,
        items: [item],
        label: runLabel([item]),
      })
    }
  }
  return result
}
