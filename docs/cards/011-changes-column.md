---
id: "011"
title: The change list has its own column and says what changed
branch: feat/changes-column
touches:
  - src/App.vue
  - src/App.test.ts
  - src/components/ChangeList.vue
  - src/components/NodeClause.vue
  - src/domain/view.ts
  - src/domain/view.test.ts
  - src/styles/tokens.css
  - docs/**
  - README.md
depends_on: ["010"]
docs:
  - docs/conventions/ui.md
  - docs/conventions/web-platform.md
  - .claude/skills/ui-review/SKILL.md
---

# Card 011: changes column

The change list is the main tool for the question "what changed". It shared one side panel with the outline.
Each list had half of the height, and an entry said "Edited" but not what was edited.

## In scope

- On a window of 1200 pixels or more, the change list is a column on the right, with the full height.
  The outline keeps the left column. On a smaller window the two lists stay in one panel.
- An entry of the change list says what changed, such as "Value changed", and shows the full path of the node.
- A clause that holds a change has an edge in the colour for edits, like an added or a removed clause.
- The README says that the code is larger than the task needs, why, and where it would get smaller.

## Out of scope

- A rewrite to make the code smaller.
- Marks for changes that the reader saw.

## Acceptance

- **A1** At 1280 pixels the outline is on the left and the change list on the right. Each has the full height below the top bar. Proof: browser check.
- **A2** At 1280 pixels the reading column is at least 60 characters wide, and the page has no horizontal scroll. Proof: browser check.
- **A3** At 1000 pixels the two lists share the left panel, as before. Proof: browser check.
- **A4** The entry for `f-leave-annual-days` in v1 to v2 says "Value changed" and shows the path "Leave / Annual leave". Proof: a unit test and a mount test.
- **A5** The entry for `f-hours-overtime-max` says "Label changed". The entry for a paragraph says "Text changed". Proof: a unit test.
- **A6** A clause with an edited field has the edge. A clause with no change has none. Proof: a mount test.
- **A7** The checks of card 006 still hold: 21 steps of "Next change" on v1 to v3 with "Changes only". Proof: browser check.

## Open decisions

- None known.

## Handoff

- **Gate:**
- **Review:**
- **Measured:**
- **Not measured:**
- **Left:**
