import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// Read from disk: Vitest gives an empty string for an imported CSS file.
// Vitest runs from the root of the project.
const css = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8')

// ui.md rule 1: text has a contrast of 4.5 to 1 or more against its background, in both themes.
// The numbers come from this test, which reads the token file. Nobody types them by hand.

type Theme = Map<string, string>

function declarations(block: string): Theme {
  return new Map(
    [...block.matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g)].map((m) => [m[1]!, m[2]!]),
  )
}

const darkStart = css.indexOf('@media (prefers-color-scheme: dark)')
const light = declarations(css.slice(0, darkStart))
// A dark token replaces the light one. A token with no dark value keeps its light value.
const dark: Theme = new Map([...light, ...declarations(css.slice(darkStart))])

function luminance(hex: string): number {
  const channel = (offset: number) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5)
}

/** The WCAG 2 contrast ratio of two colours. */
function contrast(a: string, b: string): number {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (high! + 0.05) / (low! + 0.05)
}

// Each pair that the app puts text on: [text token, background token].
const TEXT_PAIRS: Array<[string, string]> = [
  ['--text', '--bg'],
  ['--text', '--surface'],
  ['--muted', '--bg'],
  ['--muted', '--surface'],
  ['--accent', '--bg'],
  ['--accent', '--surface'],
  ['--added-text', '--added-bg'],
  ['--removed-text', '--removed-bg'],
  ['--edited-text', '--edited-bg'],
  ['--moved-text', '--moved-bg'],
  ['--neutral-text', '--neutral-bg'],
  // The text of an added or a removed node stands on the tint of that node.
  ['--text', '--added-bg'],
  ['--text', '--removed-bg'],
  ['--muted', '--added-bg'],
  // The title of a removed section has no tint behind it.
  ['--removed-text', '--bg'],
]

describe('colour tokens', () => {
  it('reads both themes from the token file', () => {
    expect(darkStart).toBeGreaterThan(0)
    expect(light.get('--bg')).toBe('#ffffff')
    expect(dark.get('--bg')).not.toBe(light.get('--bg'))
  })

  it('knows the contrast formula: black on white is 21 to 1', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 5)
  })

  for (const [name, theme] of [
    ['light', light],
    ['dark', dark],
  ] as const) {
    describe(`${name} theme`, () => {
      it.each(TEXT_PAIRS)('%s on %s has a contrast of 4.5 to 1 or more', (text, background) => {
        const textColour = theme.get(text)
        const backgroundColour = theme.get(background)

        expect(textColour, `${text} is missing`).toBeDefined()
        expect(backgroundColour, `${background} is missing`).toBeDefined()
        expect(contrast(textColour!, backgroundColour!)).toBeGreaterThanOrEqual(4.5)
      })

      it('the edge of a control has a contrast of 3 to 1 or more against the page', () => {
        expect(contrast(theme.get('--border-control')!, theme.get('--bg')!)).toBeGreaterThanOrEqual(
          3,
        )
      })
    })
  }
})
