---
id: "006"
title: A reader reaches each change fast and shares one
branch: feat/find-changes
touches:
  - src/composables/**
  - src/components/**
  - src/App.vue
depends_on: ["005"]
docs:
  - docs/SPEC.md
  - docs/conventions/web-platform.md
  - docs/conventions/ui.md
  - docs/conventions/vue.md
---

# Card 006: find changes

`sec-tools` has 40 clauses and few changes. This card serves US5 and US7.

## In scope, in this order

The order is the cut order from the bottom. If the time box ends, stop and list the rest in the Handoff.

1. "Changes only": each run of unchanged nodes folds into one closed `<details>` with a count (D10).
2. "Previous change" and "Next change" buttons. The page moves to the change, and the change takes focus.
3. The address bar holds the base version, the target version and the selected change. A reload gives the same view.
4. "Copy link": the link goes to the clipboard, and a status message says so.

## Out of scope

- Single-key shortcuts. A key that acts with no modifier can clash with assistive tools.
- "Mark as reviewed". It is listed as a next step.

## Acceptance

- **A1** With "Changes only", `sec-tools` shows its changed clauses and folds of unchanged ones. Proof: browser check.
- **A2** The summary of a fold says how many nodes it holds, for example "37 unchanged clauses". Proof: browser check.
- **A3** Find-in-page for the name of a folded tool finds it and opens the fold. Proof: browser check.
- **A4** "Next change" reaches each change of v1 to v3 in document order. Proof: browser check.
- **A5** After a move, the change has focus and the top bar does not cover it. Proof: browser check.
- **A6** A reload with the same address shows the same comparison and the same change. Proof: browser check.
- **A7** "Copy link" announces "The link is copied." in a status region. Proof: browser check.

## Open decisions

- None known.

## Handoff

- **Gate:**
- **Review:**
- **Measured:**
- **Not measured:**
- **Left:**
