/**
 * The text of a paragraph with its markup tags taken away.
 * The result is for display as plain text only. It is never rendered as HTML (D7).
 */
export function plainText(markup: string): string {
  return markup.replace(/<[^>]*>/g, '')
}
