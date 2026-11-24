---
id: "009"
title: A reviewer can run the app and read why it is built this way
branch: docs/readme
touches:
  - README.md
  - PROGRESS.md
  - docs/**
depends_on: ["006"]
docs:
  - docs/BRIEF.md
  - docs/conventions/writing.md
---

# Card 009: README

This card is never cut. The brief asks for each of its sections.

## In scope

`README.md`, with these sections in this order:

1. **Run.** `npm install`, `npm run dev`, `npm run gate`.
2. **What it does.** Three sentences and one screenshot.
3. **The reader.** Who the app is for.
4. **Questions and assumptions.** The eight questions from `docs/SPEC.md`, each with its assumption.
5. **What the data holds.** The short form of the table in `docs/SPEC.md`.
6. **Decisions.** One line for each decision, with a link to `docs/DECISIONS.md`.
7. **Dependencies.** One line of reason for each, dev dependencies too.
8. **How I worked with an agent.** Cards, conventions and their sources, the test-first seam, the gate, the reviewer.
   What the agent got wrong and how the work caught it.
9. **Testing.** What has a test, what has a browser check, and why.
10. **Not done and what I would do next.**

Also: the final state of `PROGRESS.md`, and a check that each card's Handoff is filled in.

## Out of scope

- New features. A gap goes into section 10.

## Acceptance

- **A1** A fresh clone runs with `npm install` and `npm run dev`. Proof: a clone in a temporary folder.
- **A2** Each dependency in `package.json` has one line in the README. Proof: a comparison of the two lists.
- **A3** Each number in the README comes from a command. Proof: the command next to it in the Handoff.
- **A4** The company name is in no file. Proof: `git grep -i`.
- **A5** The prose lint passes on the README. Proof: the gate.
- **A6** Section 10 lists each card that was cut and each acceptance criterion that did not pass.

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
  | Prose lint | PASS | It failed once on a sentence of 27 words in the README. The sentence is a list now |

- **Review:** not needed for this card.
- **Measured:**
  - A2: a script compared `package.json` with the README. Each of the 19 packages has a line.
  - A3: each number in the README comes from a command.
    152 tests: `npm test`. 31 lines: `lcs.ts` with no comment and no empty line. 13 decisions: the headings of `docs/DECISIONS.md`.
    318 pixels and "about 60 inputs": the record of cards 006 and 005.
  - A4: `git grep -i` for the company name finds nothing.
  - A5: the prose lint passes on the README.
  - A6: the section "Not done" names cards 007 and 008, and each criterion that was not measured.
- **Not measured:**
  - A1: a fresh clone. It is a step of the release, after the last card is merged.
- **Left:**
  - The README has no section for time. The brief does not ask for one.
  - The screenshot is `docs/screenshot.jpg`: version 1 against version 3, light theme, "Changes only".
  - If card 007 is built, three places change: the test count, "Decided, not built", and the pull request range.
