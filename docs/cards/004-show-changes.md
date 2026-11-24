---
id: "004"
title: A reader picks two versions and sees each change in place
branch: feat/show-changes
touches:
  - src/composables/**
  - src/components/**
  - src/styles/**
  - src/App.vue
depends_on: ["003"]
docs:
  - docs/SPEC.md
  - docs/conventions/ui.md
  - docs/conventions/vue.md
  - docs/conventions/writing.md
  - .claude/skills/ui-review/SKILL.md
---

# Card 004: show changes

This card joins the engine to the page. It serves US2, US3, US4 and US6.

## In scope

- Two version pickers in the top bar. The base version is always older than the target version (D2).
- The default comparison is the previous version against the latest.
- A badge on each changed node: a text label and a glyph for its kind.
- An edited field shows the earlier value and the current value. An edited paragraph shows the words that changed.
- A removed node shows at its earlier place, struck through (D1).
- A moved node shows "Moved from" and the earlier section. The earlier place holds a short marker.
- A clause with the status `draft` shows the badge "Draft".
- The change list in the side panel, above the outline. A click moves to the change.
- A count of changes on each section in the outline.
- A summary in the top bar: the number of changes, and "N formatting changes are hidden" with one control.
- The colour tokens for the change kinds, in light and dark.

## Out of scope

- Links and bold in paragraph text. Card 005.
- "Changes only", next and previous, the link in the address bar. Card 006.

## Acceptance

- **A1** The pickers never allow a base version that is not older than the target. Proof: browser check.
- **A2** v2 to v3 shows 10 changes, and v1 to v2 shows 12 changes with 2 formatting changes hidden. Proof: browser check.
- **A3** Each change kind has a text label and a glyph. No kind depends on colour alone. Proof: browser check.
- **A4** Each entry of the change list moves to a mark that is in view. Proof: browser check.
- **A5** "Show formatting changes" shows `p-leave-sick-1` and `f-exp-equipment-limit`. Proof: browser check.
- **A6** Each text and background token pair has a contrast of 4.5 to 1 in both themes. Proof: a unit test.
- **A7** `cl-remote-coworking` shows "Added" and "Draft". Proof: browser check.
- **A8** The UI review passes. Proof: the checklist in the Handoff.

## Open decisions

- None known.

## Handoff

- **Gate:**

  | Step | Result | Detail |
  |---|---|---|
  | Type check | PASS | |
  | Lint | PASS | |
  | Format check | PASS | |
  | Unit tests | PASS | 100 of 100 |
  | Build | PASS | |
  | Prose lint | PASS | 0 hard findings |

- **Review:** approved. No Critical finding. Four Important findings, all fixed.
  1. The contrast test did not hold each pair that the components use. Four pairs are added. All pass.
  2. `TextChange.vue` computed the word comparison, against the rule "a component never computes a diff".
     The engine now gives the changed words with the edit, and the component only renders them.
  3. The text below a removed node had a line from CSS only, so a screen reader read it as current text.
     Removed text is now a real `<del>` with the hidden word "Removed".
  4. Raw sizes in components are tokens now.
- **Measured:** in the browser at 1280 by 720 pixels, light and dark, unless a line says otherwise.
  - A1: mount test. With version 2 as target, the base picker offers only version 1.
  - A2: v2 to v3 shows "10 changes". v1 to v2 shows "12 changes" and "2 formatting changes are hidden."
  - A3: each of the 7 badges has a glyph and a word. Removed text has a line, and added text is underlined.
  - A4: each of the 12 entries of the change list for v1 to v2 jumps to its mark.
    The mark is below the top bar and in view, and it has focus.
  - A5: after "Show formatting changes", the summary says "14 changes", and both formatting changes show a mark.
  - A6: 30 contrast tests. Each pair is 4.5 to 1 or more in both themes.
  - A7: `cl-remote-coworking` shows "Draft" and "Added".
  - A8: the UI checklist, rule by rule:
    1 contrast PASS (test). 2 not colour alone PASS. 3 `<del>` and `<ins>` PASS. 4 focus ring PASS.
    5 keyboard PASS for the pickers, the toggle and the links. 6 nothing hides the focus PASS.
    7 semantic HTML PASS. 8 `aria-pressed` on the toggle PASS. 9 one live region PASS.
    10 long values wrap PASS. 11 motion: only the smooth scroll, off with reduced motion. 12 scroll areas PASS.
  - The console has no error after a fresh load, a change of versions and a jump.
- **Not measured:**
  - A screen reader. The `<del>`, `<ins>` and hidden words were checked in the DOM only.
  - A width under 900 pixels with the comparison. Card 002 measured that layout without it.
- **Left:**
  - The side panel has two lists, each with its own scroll. With one scroll, the outline pushed the change list away.
    `ui.md` rule 12 says so now.
  - An edit of a paragraph holds `parts`: the words that differ. Card 005 changes them from text to tokens.
  - `PresenceText.vue` wraps the text of a removed node in `<del>`.
  - Vitest gives an empty string for an imported CSS file. The contrast test reads the file from disk.
