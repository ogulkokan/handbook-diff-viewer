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
---

# Card 002: read one version

Before the app can compare, it must load and show one document. This card serves US1.

## In scope

- Types for the document and the four node types, from `data/README.md`.
- A loader with lazy `import.meta.glob('../data/v*.json')`. It finds the versions by itself.
- A type guard that rejects a file with a wrong shape and says which node is wrong.
- An index of the tree: for each id, the node, its parent and its place.
- The document view: sections and clauses as `<details>`, fields as label and value, paragraphs as plain text.
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
- **Review:**
- **Measured:**
- **Not measured:**
- **Left:**
