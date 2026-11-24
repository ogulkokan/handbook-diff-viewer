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

  | Step | Result | Detail |
  |---|---|---|
  | Type check | PASS | |
  | Lint | PASS | |
  | Format check | PASS | |
  | Unit tests | PASS | 152 of 152 |
  | Build | PASS | |
  | Prose lint | PASS | 0 hard findings |

- **Review:** the first verdict was "changes needed". One Critical finding and five Important ones, all fixed.
  1. Critical: "Changes only" folded the clauses of an added section as "3 unchanged clauses".
     The checks before the review ran on v2 to v3 only, which has no added section.
     A test names the bug, and the fold rule now needs a node to be in both versions.
  2. The ring of the selected change was off while that change had focus. A CSS rule with more weight won.
  3. A3 was not run, and A4 was measured on v2 to v3. A4 is now measured on v1 to v3. A3 is with the owner.
  4. Two tests built their expected fold labels from the output. They now name the five labels from the data.
  5. The status region said "3 of 10" with no noun, and it read the formatting sentence at each step.
     It now says "Change 3 of 10" and nothing else.
  6. The folds had no `:open` binding. The open folds are state now, and `@toggle` keeps it in step.
  Also from the review: "Next change" now goes on from the place of the reader, not from the top.
- **Measured:** in the browser at 1280 by 720 pixels, dark theme, on v1 to v3 with "Changes only".
  - A1: `sec-tools` shows its changed clauses and folds of the others. `sec-remote` shows its 4 clauses and no fold.
  - A2: on v2 to v3 the folds of `sec-tools` say 21, 1, 1, 5 and 8 unchanged clauses. A mount test checks the five labels.
  - A4: "Next change" reaches 21 changes in document order, from `f-intro-reviewed` to `sec-remote`.
  - A5: at each of the 21 steps the change is below the top bar, in view and has focus. Its ring is 2 pixels.
  - A6: mount test. An address with both versions, both switches and a node opens that view.
  - A7: mount tests. "Copy link" says "The link is copied." or "The link is not copied."
  - The top bar is one row of 48 pixels with no overflow. The console has no error.
- **Not measured:**
  - A3: find-in-page on a folded tool. The preview pane does not open find-in-page, and no script can start it.
    The owner checks it by hand in a browser. Until then this criterion is NOT RUN.
  - A width under 900 pixels with the new controls.
  - A screen reader.
- **Left:**
  - Two bugs from earlier cards showed here and are fixed.
    The hidden screen reader text in the outline made the page taller, and the outline kept an old mark at the end of the page.
  - The selected node can be a section from the outline. Then the top bar shows the count, and the two buttons go on from there.
  - After "Next change" the focus is on the change. A keyboard reader goes back to the top bar with Shift and Tab.
    The card rules out single-key shortcuts, so a shortcut for this is a product decision.
  - An address always holds `base` and `target`, so a link stays the same comparison when a new version arrives.
