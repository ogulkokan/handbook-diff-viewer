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

  | Step | Result | Detail |
  |---|---|---|
  | Type check | PASS | |
  | Lint | PASS | |
  | Format check | PASS | |
  | Unit tests | PASS | 163 of 163 |
  | Build | PASS | |
  | Prose lint | PASS | 0 hard findings |

- **Review:** approved. No Critical finding. Two Important findings, both fixed. The data does not reach either one.
  1. A lone field could pair with another field of the same clause. Only a section or a clause can pair now.
  2. A node inside a pair with no node to match had a colour and no badge. It has its own change now.
- **Measured:**
  - A1, A2, A3: unit tests. The pair is `cl-sec-passwords` with `cl-sec-credentials`. Trello and Cursor do not pair.
    The paragraph of the pair marks `offered` as removed and `available` as added.
  - A4: mount test and browser. v1 to v2 shows 11 changes. Before this card it showed 12.
  - A5: mount test and browser. The clause shows the badge "Replaced, likely renamed" with both titles.
  - The reviewer scored each removed and added pair of the three comparisons. Only this pair is above 0.4. It scores 0.96.
- **Not measured:**
  - A document where two different clauses hold the same values, for example two tools with one vendor and one status.
    They would pair. The data has no such case.
- **Left:**
  - An edit inside a pair is part of the pair. It is not in the change list and not in the counts.
  - A formatting change inside a pair is not in the count of formatting changes.
  - A pair across two parents is out of scope. A node that moved and got a new id stays removed and added.
