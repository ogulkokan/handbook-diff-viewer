---
id: "010"
title: Two short clauses with the same values do not pair as a rename
branch: fix/short-clause-pairs
touches:
  - src/domain/pairReplaced.ts
  - src/domain/pairReplaced.test.ts
  - docs/**
  - README.md
depends_on: ["007"]
docs:
  - docs/DECISIONS.md
  - .claude/skills/tdd/SKILL.md
---

# Card 010: short clause pairs

Card 007 pairs a removed and an added clause when their content is at least 80% alike.
A clause with two words of content is 100% alike with each clause that holds the same two words.
In `sec-tools`, Jira, Confluence and Loom all hold "Atlassian" and "Approved".
If a version removes one of them and adds another, the app would say "Replaced, likely renamed" for two tools.

## In scope

- A clause or a section pairs only when each side holds 10 words of content or more.
- The limit is in D6 and in `docs/SPEC.md`.
- Three notes in the README: this limit, a rename across two sections, and one version with no comparison.
- A row for the nested section `sec-travel` in the data tables.

## Out of scope

- A pair across two parents.
- A way to read one version with no comparison.

## Acceptance

- **A1** A removed tool and an added tool with the same vendor and status stay removed and added. Proof: a unit test.
- **A2** `cl-sec-passwords` still pairs with `cl-sec-credentials`. Proof: the unit tests of card 007.
- **A3** The counts of the three comparisons do not change. Proof: the unit and mount tests.

## Open decisions

- None known.

## Handoff

- **Gate:**
- **Review:** not needed. The change is one condition with its test.
- **Measured:**
- **Not measured:**
- **Left:**
