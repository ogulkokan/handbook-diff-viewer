---
id: "002"
title: A reader opens one version and moves through it
branch: feat/read-document
touches:
  - src/domain/**
  - src/composables/**
  - src/components/**
  - src/styles/**
  - src/App.vue
depends_on: ["001"]
docs:
  - docs/SPEC.md
  - docs/conventions/web-platform.md
  - docs/conventions/ui.md
  - docs/conventions/vue.md
---

# Card 002: read one version

Before the app can compare, it must load and show one document. This card serves US1.

## In scope

- Types for the document and the four node types, from `data/README.md`.
- A loader with lazy `import.meta.glob('../data/v*.json')`. It finds the versions by itself.
- A type guard that rejects a file with a wrong shape and says which node is wrong.
- An index of the tree: for each id, the node, its parent and its place.
- The document view: sections and clauses with real headings, fields as label and value, paragraphs as plain text.
- The side panel with the outline. A click moves to the section or the clause.
- The outline marks the section that is in view (`IntersectionObserver`, `aria-current`).
- The base styles and the layout: top bar, side panel, reading column.

## Out of scope

- Any comparison. Cards 003 and 004.
- Inline markup. This card shows paragraph text with the tags removed. Card 005 renders the markup.
- Final colours. Card 004 adds the tokens for the change kinds.

## Acceptance

- **A1** The three versions load, and each has the top sections that its file holds. Proof: a unit test.
- **A2** A file with a wrong node gives an error that names the node. Proof: a unit test of the guard.
- **A3** The outline lists each section and clause in display order. Proof: browser check.
- **A4** A click in the outline moves to the target, and the top bar does not cover it. Proof: browser check.
- **A5** The nested section `sec-travel` shows under `sec-expenses`. Proof: browser check.
- **A6** The outline marks the section in view while the page scrolls. Proof: browser check.
- **A7** A `v4.json` in `data/` shows as a version with no code change. Proof: a file that is not committed.

## Open decisions

- None known.

## Handoff

- **Gate:**

  | Step | Result | Detail |
  |---|---|---|
  | Type check | PASS | |
  | Lint | PASS | |
  | Format check | PASS | |
  | Unit tests | PASS | 11 of 11 |
  | Build | PASS | Each version is its own chunk |
  | Prose lint | PASS | 0 hard findings |

- **Review:** approved. No Critical finding. Four Important findings, all fixed.
  1. The script that keeps the marked outline link in view also scrolled the page. Under 900 pixels the page
     jumped to the top when the section in view changed. The script now changes the scroll of the panel only.
  2. This Handoff was empty. It is now filled in.
  3. Each nested outline list got the id of the section in view (`vue.md` rule 6). A list now gets the id only
     when it holds that section.
  4. Two sizes were raw values in components. They are now tokens.
- **Measured:** in the browser at 1280 by 720 pixels, light theme, unless a line says otherwise.
  - A1: unit test. The top sections of the three versions match the files.
  - A2: unit tests. A wrong node gives an error with its id.
  - A3: the outline has 77 links, and the document has 77 headings (9 sections and 68 clauses), in the same order.
  - A4: a jump to `sec-travel` puts it at 64 pixels from the top. The top bar ends at 48 pixels. Focus is on the target.
  - A5: `sec-travel` is inside `sec-expenses`, with a heading one level lower. The mount test checks this too.
  - A6: at 6 scroll positions the marked link is the section that crosses the middle of the viewport.
    The page keeps its scroll position, and the marked link is in view inside the panel.
  - A6 at 800 pixels wide: at 4 scroll positions the page keeps its place. There is no horizontal scroll.
  - A7: a temporary `v4.json` showed as "Version 4" in the picker with no code change.
  - Keyboard: Tab goes from the version picker into the outline. The focus ring is 2 pixels.
  - Dark theme: the page renders with the dark tokens.
- **Not measured:**
  - Contrast. Card 004 adds a test that reads the token file.
  - A screen reader. The heading structure was checked in the DOM only.
- **Left:**
  - The card said "sections and clauses as `<details>`". They are headings inside `<section>` and `<article>`.
    The guide `accordion` says a heading inside `<summary>` is dropped by JAWS and TalkBack.
    `<details>` stays for the fold of unchanged nodes in card 006.
  - Each node has its id as the id of its element. A link to `#<node id>` jumps to it.
  - `IntersectionObserver` does not run in a page that is hidden. Check the outline mark with the page in view.
  - A smooth scroll over a long distance takes more than one second. Wait before a measurement.
