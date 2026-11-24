---
id: "003"
title: The engine finds each change between two versions
branch: feat/diff-engine
touches:
  - src/domain/**
depends_on: ["002"]
docs:
  - docs/SPEC.md
  - docs/DECISIONS.md
  - docs/conventions/testing.md
  - .claude/skills/tdd/SKILL.md
---

# Card 003: diff engine

This is the core of the app. It is plain TypeScript, and it is built test first.

## In scope

- `lcs()`: the longest common subsequence of two lists, with a function that says when two items are equal.
- `diffDocuments(base, target)`: the changes of one comparison, in document order.
- The kinds added, removed, edited, moved and reordered (D3, D4).
- An added or removed node with children is one change at its top node.
- The formatting rule from `docs/SPEC.md` (D5). A formatting change has its own flag.
- `diffWords(a, b)`: the words that differ between two texts, for an edited paragraph.

## Out of scope

- The kind "replaced". Card 007.
- Inline markup in the word comparison. Card 005 changes the input to tokens.
- Any Vue code. A component shows the result in card 004.

## Acceptance

The expected values are in "Expected changes" in `docs/SPEC.md`. Each test names its node ids.

- **A1** v1 to v2 gives exactly the listed added, removed and edited nodes. Proof: a unit test.
- **A2** v2 to v3 gives exactly its listed changes. Proof: a unit test.
- **A3** `cl-hours-holidays` is one moved change. None of its children is added or removed. Proof: a unit test.
- **A4** The swap in `sec-comms` marks one node, not two. Proof: a unit test.
- **A5** `p-leave-sick-1` and `f-exp-equipment-limit` are formatting changes. `f-travel-hotel-limit` is not. Proof: a unit test.
- **A6** v1 to v3 gives the changes of both steps. Proof: a unit test.
- **A7** `diffWords` on `p-travel-flights-1` marks `six` as removed and `eight` as added. Proof: a unit test.
- **A8** `src/domain/` has no Vue import. Proof: `grep`.

## Open decisions

- None known.

## Handoff

- **Gate:**

  | Step | Result | Detail |
  |---|---|---|
  | Type check | PASS | |
  | Lint | PASS | The rule against a Vue import in `src/domain/` is on |
  | Format check | PASS | |
  | Unit tests | PASS | 50 of 50 |
  | Build | PASS | |
  | Prose lint | PASS | 0 hard findings |

- **Review:** approved. No Critical finding. Two Important findings, both fixed.
  1. A real bug that the data files do not hold. A node that moved into a new section was lost.
     It got no moved change and no edit, and the new section counted it in its size.
     A removed section also counted children that moved out. A test names the bug, and the engine is fixed.
  2. The v1 to v3 test checked "13 edits" and "1 reordered" with no node id. It now names the 13 ids.
- **Measured:** each line is a unit test. The expected ids come from `docs/SPEC.md`.
  - A1: v1 to v2 gives 3 added top nodes (12 nodes), 2 removed top nodes (5 nodes) and 5 edits.
  - A2: v2 to v3 gives 1 added clause, 1 removed field and 8 edits.
  - A3: `cl-hours-holidays` is one moved change, from `sec-hours` to `sec-leave`. Its child has no change.
  - A4: the swap in `sec-comms` marks one node. The 39 other clauses of `sec-tools` are not marked.
  - A5: `p-leave-sick-1` and `f-exp-equipment-limit` are formatting changes. `f-travel-hotel-limit` is not.
  - A6: v1 to v3 gives the changes of both steps, with the 13 edited ids by name.
  - A7: `diffWords` marks `six` as removed and `eight` as added in `p-travel-flights-1`.
  - A8: `grep` finds no Vue import in `src/domain/`.
  - Totals: 12 changes and 2 formatting changes for v1 to v2. 10 changes for v2 to v3.
  - Order: each test-first step has its test commit before its code commit.
- **Not measured:**
  - Speed on a large document. `lcsPairs` uses a table of one list times the other.
- **Left:**
  - `diffDocuments(base, target).changes` is in document order. A removed node comes after the sibling before it.
  - A node can have more than one change: moved, reordered and edited, in that order.
  - An added or removed change has a `size`: the nodes that the other version does not hold.
  - `diffSequence` works on any list with an equality function. Card 005 uses it on tokens.
  - The formatting rule is literal: `rooms 101,102` against `rooms 101102` is a formatting change too.
  - The view of card 004 needs the removed nodes in their place. The engine does not export that order yet.
