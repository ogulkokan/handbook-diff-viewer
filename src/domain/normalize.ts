/**
 * A text with the differences removed that do not change its meaning for a reader (D5):
 * whitespace at the ends, runs of whitespace, and the comma that groups digits in a number.
 *
 * "1,000 EUR" and "1000 EUR" give the same result. "1,5" stays as it is: the comma there is
 * not followed by a group of exactly three digits.
 */
export function withoutFormatting(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/(\d),(?=\d{3}(?!\d))/g, '$1')
}

/** True when two texts differ and the difference is formatting only. */
export function isFormattingOnly(before: string, after: string): boolean {
  return before !== after && withoutFormatting(before) === withoutFormatting(after)
}
