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
- **Review:**
- **Measured:**
- **Not measured:**
- **Left:**
