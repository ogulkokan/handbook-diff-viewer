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
- **Review:**
- **Measured:**
- **Not measured:**
- **Left:**
