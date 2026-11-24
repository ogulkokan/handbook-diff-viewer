---
id: "007"
title: A node that got a new id shows as one replaced node, labelled as a guess
branch: feat/replaced-pairs
touches:
  - src/domain/pairReplaced.ts
  - src/domain/pairReplaced.test.ts
  - src/domain/diff.ts
  - src/components/**
depends_on: ["004"]
docs:
  - docs/DECISIONS.md
  - .claude/skills/tdd/SKILL.md
---

# Card 007: replaced pairs

Stretch card. It is the first card to cut if the time box ends.

`cl-sec-passwords` and `cl-sec-credentials` are the same clause under a new id. Without this card, the reader sees one
removed clause and one added clause, and must compare them by eye.

## In scope

- `pairReplaced(changes)`: joins a removed node and an added node into one change of the kind "replaced" (D6).
- The three conditions: the same parent, the same type, and leaf text that is at least 80% alike.
- The likeness is the share of words that the two texts have in common, from `lcs()`.
- The UI shows "Replaced, likely renamed", the earlier title, the current title and the words that changed.

## Out of scope

- A pair across two parents. A node that moved and got a new id stays removed and added.
- A pair of leaves with no parent pair.

## Acceptance

- **A1** v1 to v2 pairs `cl-sec-passwords` with `cl-sec-credentials`. Proof: a unit test.
- **A2** v1 to v2 does not pair `cl-tool-trello` with `cl-tool-cursor`. Proof: a unit test.
- **A3** The pair shows the word `offered` as removed and `available` as added. Proof: a unit test.
- **A4** The change count of v1 to v2 falls from 12 to 11. Proof: browser check.
- **A5** The badge says "Replaced, likely renamed". Proof: browser check.

## Open decisions

- None known.

## Handoff

- **Gate:**
- **Review:**
- **Measured:**
- **Not measured:**
- **Left:**
