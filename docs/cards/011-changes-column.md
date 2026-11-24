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

- The change list is a column on the right, with the full height. The outline keeps the left column.
- The markup has the order of the page: the outline, the text, the change list. The Tab key follows it.
- From 1000 pixels the page has three columns. The side columns get narrower on a small window.
  Below 1000 pixels the page is one column, in the order of the markup.
- An entry of the change list says what changed, such as "Value changed", and shows the full path of the node.
- A clause that holds a change has an edge in the colour for edits, like an added or a removed clause.
- The README says that the code is larger than the task needs, why, and where it would get smaller.

## Out of scope

- A rewrite to make the code smaller.
- Marks for changes that the reader saw.

## Acceptance

- **A1** At 1280 pixels the outline is on the left and the change list on the right. Each has the full height below the top bar. Proof: browser check.
- **A2** At 1280 pixels the reading column is at least 60 characters wide, and the page has no horizontal scroll. Proof: browser check.
- **A3** At 1000 pixels the page has three columns and no horizontal scroll. At 999 pixels it has one column. Proof: browser check.
- **A8** The Tab key goes through the top bar, the outline, the text and the change list, in that order. Proof: browser check.
- **A4** The entry for `f-leave-annual-days` in v1 to v2 says "Value changed" and shows the path "Leave / Annual leave". Proof: a unit test and a mount test.
- **A5** The entry for `f-hours-overtime-max` says "Label changed". The entry for a paragraph says "Text changed". Proof: a unit test.
- **A6** A clause with an edited field has the edge. A clause with no change has none. Proof: a mount test.
- **A7** The checks of card 006 still hold: each step of "Next change" on v1 to v3 with "Changes only". Proof: browser check.

## Open decisions

- None known.

## Handoff

- **Gate:** each of the six steps passes. Unit tests: 172 of 172.
- **Review:** approved, with two Important findings. Both are fixed.
  - The markup had the change list first, so the Tab key went from the top bar to the right column, then left.
    The markup has the order of the page now, and the shared panel for small windows is gone.
  - The dark theme and the keyboard path were not checked for the new layout. They are in the list below.
- **Measured:** in a browser, on v1 to v3 with "Changes only".
  - A1: at 1280 by 720 pixels the columns are 256, 704 and 320 pixels wide. Each side column is 672 pixels high, below a top bar of 48 pixels.
  - A2: at 1280 pixels a paragraph holds 67 characters in a line. The page is 1280 pixels wide, so it has no horizontal scroll.
  - A3: at 1000 pixels the columns are 200, 540 and 260 pixels wide, and the top bar has two rows in 88 pixels. At 999 pixels the page is one column. Neither has a horizontal scroll.
  - At 1920 pixels the text is in the middle of its column, 832 pixels wide.
  - A4, A5: unit tests, and a mount test for the path.
  - A6: a mount test.
  - A7: 20 steps, from `f-intro-reviewed` to `sec-remote`. After each step the change has focus, 16 pixels below the top bar.
  - A8: the elements that take focus are in four groups, in the order of the page. None has a positive `tabindex`. Nine presses of Tab from the top of the page end in the outline, with a focus ring of 2 pixels.
  - The dark theme at 1280 and at 1000 pixels: the three columns, the badges and the edge of a changed clause.
- **Not measured:**
  - A screen reader.
  - The "Next change" steps below 1000 pixels. Only the layout was checked there.
  - At 1000 pixels a line of a paragraph holds 49 characters, less than the 60 of A2. A2 names 1280 pixels only.
- **Left:**
  - Nothing from this card.
