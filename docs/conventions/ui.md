# UI

Adapted from `nextlevelbuilder/ui-ux-pro-max-skill` at commit `cc7b20d` (MIT). Rewritten for this repository.

Taken from the source: the web rules in `quick-reference.md` and two product rows.
The product rows are "Knowledge Base / Documentation" and "E-signature / Document Workflow".
Not taken: the native app rules, the chart, landing page and motion data, the font list and the Vue rows.
The rules for Vue code are in `docs/conventions/vue.md`.

## Direction

The app is a reading tool for a document that people must trust. It is calm and dense.

- Style: minimal, with borders and no shadows. One accent colour.
- Fonts: the system font stack. No web font is loaded.
- Numbers in a count or a column use `font-variant-numeric: tabular-nums`.
- Spacing steps are 4, 8, 12, 16, 24 and 32 pixels.
- The reading column is about 75 characters wide. The side panel is 260 pixels wide.
- The top bar is one row, 48 pixels high.

## Rules in order of weight

1. **Contrast.** Text has a contrast of 4.5 to 1 or more against its background, in both themes.
2. **Colour is never the only signal.** Each change kind has a text label and a glyph.
3. **Removed and added text.** Use `<del>` with a line through it and `<ins>` with an underline.
4. **Focus.** Each control shows a focus ring of 2 pixels on `:focus-visible`.
5. **Keyboard.** Each action works with the keyboard. The tab order follows the visual order.
6. **Nothing hides the focus.** The top bar never covers the control or the target that has focus.
7. **Semantic HTML.** Use `button`, `nav`, `main` and headings in order. Never use a `div` with a click handler.
8. **State.** A toggle uses `aria-pressed`. A fold uses `<details>`.
9. **Counts.** One polite live region announces a new change count as a full phrase.
10. **Long values wrap.** Do not cut a value short. A reader must see the whole value.
11. **Motion.** Respect `prefers-reduced-motion`. Animate only `transform` and `opacity`, for 200 milliseconds or less.
12. **One scroll area.** The document scrolls with the page. Only the side panel has its own scroll.

## Tokens

`src/styles/tokens.css` holds every colour as a custom property. A component uses a token, never a hex value.
A test reads the token file and checks the contrast of each text and background pair.

| Role | Used for |
|---|---|
| `--bg`, `--surface` | The page and the panels |
| `--text`, `--muted` | Body text and secondary text |
| `--border`, `--border-control` | Lines between areas, and the edge of a control |
| `--accent` | Links, the focus ring and the current outline item |
| `--added-text`, `--added-bg` | Added |
| `--removed-text`, `--removed-bg` | Removed |
| `--edited-text`, `--edited-bg` | Edited and replaced |
| `--moved-text`, `--moved-bg` | Moved and reordered |
| `--neutral-text`, `--neutral-bg` | Draft and formatting changes |

Check the dark theme by itself. Do not assume that light values carry over.

## Do not

- Do not mark changes with red and green alone.
- Do not show a full value only in a tooltip on hover.
- Do not add shadows, gradients or counters that animate.
- Do not put a scroll area inside the reading column.
- Do not use an emoji as an icon.
