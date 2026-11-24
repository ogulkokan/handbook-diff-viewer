// The shape of the data, from data/README.md.

export type NodeType = 'section' | 'clause' | 'field' | 'paragraph'

export interface FieldNode {
  id: string
  type: 'field'
  label: string
  value: string
}

export interface ParagraphNode {
  id: string
  type: 'paragraph'
  /** May hold inline markup. Never render it as HTML (D7). */
  text: string
}

export type LeafNode = FieldNode | ParagraphNode

export interface ClauseNode {
  id: string
  type: 'clause'
  title: string
  status?: string
  children: LeafNode[]
}

export interface SectionNode {
  id: string
  type: 'section'
  title: string
  children: Array<SectionNode | ClauseNode>
}

export type DocNode = SectionNode | ClauseNode | FieldNode | ParagraphNode

export interface HandbookDocument {
  id: string
  version: number
  title: string
  updatedAt: string
  children: Array<SectionNode | ClauseNode>
}
