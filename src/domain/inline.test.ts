import { describe, expect, it } from 'vitest'

import { v2, v3 } from './fixtures'
import { indexDocument } from './indexTree'
import { diffInline, parseInline, type InlineToken } from './inline'

function textOf(document: typeof v3, id: string): string {
  const node = indexDocument(document).byId.get(id)?.node
  if (node?.type !== 'paragraph') throw new Error(`${id} is not a paragraph`)
  return node.text
}

const plain = (text: string): InlineToken => ({ text, bold: false, href: null })

describe('parseInline: the paragraph of v3 that holds unsafe markup', () => {
  // data/v3.json, p-exp-reimbursement-1: a <b>, a link, and an <img> with an onerror handler.
  const tokens = parseInline(textOf(v3, 'p-exp-reimbursement-1'))

  it('holds no trace of the img element or of its handler', () => {
    const all = tokens.map((token) => token.text).join('')

    expect(all).not.toContain('<')
    expect(all).not.toContain('onerror')
    expect(all).not.toContain('unsafe render')
    expect(all).toBe(
      'Submit receipts within 30 days of the expense through the expenses portal. Late submissions may be rejected.',
    )
  })

  it('keeps the link with its address', () => {
    expect(tokens).toContainEqual({
      text: 'expenses portal',
      bold: false,
      href: 'https://intranet.example.com/expenses',
    })
  })

  it('keeps the bold words', () => {
    expect(tokens).toContainEqual({ text: '30 days', bold: true, href: null })
  })
})

describe('parseInline: what it lets through', () => {
  it('gives one plain token for text with no markup', () => {
    expect(parseInline('Plain text.')).toEqual([plain('Plain text.')])
  })

  it('reads <strong> as bold, like <b>', () => {
    expect(parseInline('a <strong>b</strong>')).toEqual([
      plain('a '),
      { text: 'b', bold: true, href: null },
    ])
  })

  it('keeps bold and a link together when they nest', () => {
    expect(parseInline('<b><a href="https://a.example/x">go</a></b>')).toEqual([
      { text: 'go', bold: true, href: 'https://a.example/x' },
    ])
  })

  it('turns a character reference into its character', () => {
    expect(parseInline('Fish &amp; chips &lt;b&gt;')).toEqual([plain('Fish & chips <b>')])
  })
})

describe('parseInline: what it does not let through', () => {
  it('makes a link with a javascript: address plain text', () => {
    expect(parseInline('<a href="javascript:alert(1)">click</a>')).toEqual([plain('click')])
  })

  it('makes a link with a disguised javascript: address plain text', () => {
    // Forms that the review tried: mixed case, a tab inside the scheme, a character reference.
    for (const address of [
      'JaVaScRiPt:alert(1)',
      'java\tscript:alert(1)',
      '&#106;avascript:alert(1)',
    ]) {
      expect(parseInline(`<a href="${address}">click</a>`)).toEqual([plain('click')])
    }
  })

  it('makes a link inside an svg element nothing at all', () => {
    expect(parseInline('a<svg><a xlink:href="javascript:alert(1)">x</a></svg>b')).toEqual([
      plain('ab'),
    ])
  })

  it('makes a link with a data: address or with no address plain text', () => {
    expect(parseInline('<a href="data:text/html,x">a</a><a>b</a>')).toEqual([plain('ab')])
  })

  it('makes a link with a relative address plain text', () => {
    expect(parseInline('<a href="/expenses">a</a>')).toEqual([plain('a')])
  })

  it('drops an element that it does not know, and keeps its text', () => {
    expect(parseInline('an <i>important</i> <u>note</u>')).toEqual([plain('an important note')])
  })

  it('drops a script and a style element with their content', () => {
    expect(parseInline('before<script>alert(1)</script><style>p{}</style>after')).toEqual([
      plain('beforeafter'),
    ])
  })

  it('drops an attribute that it does not know', () => {
    expect(parseInline('<b onclick="alert(1)" style="x">bold</b>')).toEqual([
      { text: 'bold', bold: true, href: null },
    ])
  })
})

describe('diffInline', () => {
  it('v2 to v3, p-exp-reimbursement-1: the new words are added, and the link stays a link', () => {
    const parts = diffInline(
      parseInline(textOf(v2, 'p-exp-reimbursement-1')),
      parseInline(textOf(v3, 'p-exp-reimbursement-1')),
    )
    const added = parts.filter((part) => part.kind === 'added')

    expect(parts.filter((part) => part.kind === 'removed')).toEqual([])
    expect(added.map((part) => part.text).join('')).toBe(' through the expenses portal')
    expect(added).toContainEqual({
      kind: 'added',
      text: 'expenses portal',
      bold: false,
      href: 'https://intranet.example.com/expenses',
    })
    // The bold words are in both versions.
    expect(parts).toContainEqual({ kind: 'same', text: '30 days', bold: true, href: null })
  })

  it('gives back both texts, like diffWords', () => {
    const before = parseInline('Pay within <b>30 days</b> of the expense.')
    const after = parseInline('Pay within <b>14 days</b> of the invoice, please.')

    const parts = diffInline(before, after)
    const join = (...kinds: string[]) =>
      parts
        .filter((part) => kinds.includes(part.kind))
        .map((part) => part.text)
        .join('')

    expect(join('same', 'removed')).toBe('Pay within 30 days of the expense.')
    expect(join('same', 'added')).toBe('Pay within 14 days of the invoice, please.')
  })

  it('reports words that only became bold as removed and added', () => {
    const parts = diffInline(parseInline('very important'), parseInline('very <b>important</b>'))

    expect(parts).toEqual([
      { kind: 'same', text: 'very ', bold: false, href: null },
      { kind: 'removed', text: 'important', bold: false, href: null },
      { kind: 'added', text: 'important', bold: true, href: null },
    ])
  })
})
