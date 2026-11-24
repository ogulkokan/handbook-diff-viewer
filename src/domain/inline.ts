import { diffRuns, wordsOf, type PartKind } from './textDiff'

/** A run of paragraph text with one format. Rendered as text, never as HTML (D7). */
export interface InlineToken {
  text: string
  bold: boolean
  /** An absolute http or https address, or null. */
  href: string | null
}

export interface InlinePart extends InlineToken {
  kind: PartKind
}

// The text inside these elements is code or a fallback, not content for a reader.
const DROPPED_WITH_CONTENT = new Set([
  'SCRIPT',
  'STYLE',
  'TEMPLATE',
  'NOSCRIPT',
  'IFRAME',
  'OBJECT',
  'EMBED',
  'SVG',
  'MATH',
  'TEXTAREA',
  'TITLE',
])

function safeHref(raw: string | null): string | null {
  if (!raw) return null
  let url: URL
  try {
    // No base: a relative address has no meaning in this app and does not parse.
    url = new URL(raw)
  } catch {
    return null
  }
  return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
}

/**
 * Reads the inline markup of a paragraph into tokens.
 *
 * The rule is an allowlist: <b> and <strong> make text bold, and <a> with an http or https
 * address makes a link. Each other element is dropped and its text stays. Attributes are never
 * copied. The markup is parsed by DOMParser into a document of its own, where no script runs
 * and no resource loads. Nothing from that document is put into the page.
 */
export function parseInline(markup: string): InlineToken[] {
  const tokens: InlineToken[] = []

  const push = (text: string, bold: boolean, href: string | null) => {
    if (text === '') return
    const last = tokens.at(-1)
    if (last && last.bold === bold && last.href === href) last.text += text
    else tokens.push({ text, bold, href })
  }

  const walk = (parent: Node, bold: boolean, href: string | null) => {
    for (const child of parent.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        push(child.textContent ?? '', bold, href)
      } else if (child instanceof Element) {
        const tag = child.tagName.toUpperCase()
        if (DROPPED_WITH_CONTENT.has(tag)) continue
        walk(
          child,
          bold || tag === 'B' || tag === 'STRONG',
          tag === 'A' ? safeHref(child.getAttribute('href')) : href,
        )
      }
    }
  }

  // The explicit <body> keeps whitespace at the start of the text.
  const parsed = new DOMParser().parseFromString(`<!doctype html><body>${markup}`, 'text/html')
  walk(parsed.body, false, null)
  return tokens
}

const sameWord = (x: InlineToken, y: InlineToken) =>
  x.text === y.text && x.bold === y.bold && x.href === y.href

function words(tokens: readonly InlineToken[]): InlineToken[] {
  return tokens.flatMap((token) =>
    wordsOf(token.text).map((text) => ({ text, bold: token.bold, href: token.href })),
  )
}

/**
 * The words that differ between two token lists. Each part keeps its format, so an edited
 * paragraph still shows its bold words and its links. A word whose format changed is removed
 * in its earlier format and added in its current one.
 */
export function diffInline(
  before: readonly InlineToken[],
  after: readonly InlineToken[],
): InlinePart[] {
  const parts: InlinePart[] = []
  for (const run of diffRuns(words(before), words(after), sameWord)) {
    for (const word of run.items) {
      const last = parts.at(-1)
      if (last && last.kind === run.kind && last.bold === word.bold && last.href === word.href) {
        last.text += word.text
      } else {
        parts.push({ kind: run.kind, ...word })
      }
    }
  }
  return parts
}
