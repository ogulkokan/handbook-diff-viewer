# Spec: compare two versions of a document

The brief is in `docs/BRIEF.md`. This spec says what the app does and why. The decisions are in `docs/DECISIONS.md`.

## Problem

A team keeps a handbook as a structured document. A new version appears a few times a year.
A reader who knows an older version must find what changed. Today the reader must read the whole document again.

## The reader

The reader is a team member who read an older version some months ago.
The reader asks one question: "What changed since then, and does it change what I do?"
The reader does not edit the document. After the review, the reader shares a link to one change or closes the app.

## Solution

The app shows one document: the target version, in its reading order. It marks each change in place.
The outline is in a column on the left, and a column on the right lists all changes. A top bar holds the two version pickers and the controls.

## User stories

- **US1** As a reader, I open the document and move to any section or clause through the outline.
- **US2** As a reader, I choose the version I read before and the version I want to read now.
- **US3** As a reader, I see each change where it is in the document, with the earlier text next to the current text.
- **US4** As a reader, I see one list of all changes and jump from the list to the document.
- **US5** As a reader, I hide what did not change, and I can still find it with find-in-page.
- **US6** As a reader, I know when the app hides or guesses something, and I can inspect it.
- **US7** As a reader, I copy a link that opens the same comparison at the same change.
- **US8** As a reader, I am safe from markup in the data that tries to run code.

## Change kinds

A node can have more than one change. For example, a clause can be moved and edited.

| Kind | Rule | Shown as |
|---|---|---|
| added | The id is only in the target version | The node, with the badge "Added" |
| removed | The id is only in the base version | The node at its earlier place, struck through |
| edited | Same id, and a title, label, value, text or status differs | Earlier and current text. A paragraph shows the words that changed |
| moved | Same id, different parent | The node at its new place, with "Moved from" and the earlier section |
| reordered | Same parent, different place among the siblings that both versions share | The badge "Reordered" on the fewest nodes that explain the order |
| replaced | A removed and an added clause or section, at least 80% alike, each with 10 words or more | One change: "Replaced, likely renamed" |

An added or removed node with children is one change, at the top node. The app does not count each child.

A **formatting change** is an edit where the two texts are equal after these steps:

1. Remove whitespace at the start and at the end.
2. Replace each run of whitespace with one space.
3. Remove a comma between a digit and a group of exactly three digits.

The app hides formatting changes by default. It shows their count, and one control shows them.

## What the mock data holds

Each row tests one point that the brief leaves open. The rows were found by a comparison of the three files.

| # | Node | What happens | Tests |
|---|---|---|---|
| 1 | `p-leave-sick-1`, v1 to v2 | Only whitespace changes | Formatting |
| 2 | `f-exp-equipment-limit`, v1 to v2 | `1,000 EUR` becomes `1000 EUR` | Formatting |
| 3 | `f-intro-reviewed`, v1 to v2 | `2026-01-15` becomes `02.04.2026` | A real edit in a new format |
| 4 | `cl-hours-holidays`, v1 to v2 | Moves from `sec-hours` to `sec-leave`, content equal | Moved |
| 5 | `sec-comms`, v1 to v2 | Two clauses swap places | Reordered |
| 6 | `cl-sec-passwords` to `cl-sec-credentials`, v1 to v2 | New id and title, same place, one word differs | Replaced |
| 7 | `cl-tool-trello` to `cl-tool-cursor`, v1 to v2 | A real removal and a real addition | Must not pair as replaced |
| 8 | `f-hours-overtime-max`, v1 to v2 | The label changes, the value does not | Edited label |
| 9 | `sec-hours`, v2 to v3 | The title changes | Edited title |
| 10 | `p-exp-reimbursement-1`, v2 to v3 | Gains a link and an `img` with an `onerror` handler | Unsafe markup |
| 11 | `cl-remote-coworking`, v3 | A new clause with the status `draft` | Status |
| 12 | `f-sec-access-cadence`, v2 to v3 | The field is removed | Removed leaf |
| 13 | `sec-tools` | 40 clauses, and 5 status edits over two versions | Scale |
| 14 | `sec-remote`, v2 | A new section with 3 clauses | Added subtree |
| 15 | v1 to v3 | All rows above at once | Any two versions |
| 16 | `sec-travel`, each version | A section inside the section `sec-expenses` | Nesting |

## Expected changes

These lists are the expected values for the tests. They come from the files, not from the app.

**v1 to v2**

- Added, top nodes: `cl-sec-credentials`, `cl-tool-cursor`, `sec-remote`. The three hold 12 nodes.
- Removed, top nodes: `cl-sec-passwords`, `cl-tool-trello`. The two hold 5 nodes.
- Moved: `cl-hours-holidays`.
- Reordered: one of `cl-comms-channels` and `cl-comms-meetings`, never both.
- Edited: `f-intro-reviewed`, `f-hours-overtime-max`, `f-leave-annual-days`, `f-travel-hotel-limit`, `f-tool-chatgpt-status`.
- Formatting: `p-leave-sick-1`, `f-exp-equipment-limit`.
- Replaced, after card 007: `cl-sec-passwords` with `cl-sec-credentials`.

**v2 to v3**

- Added, top node: `cl-remote-coworking`, with the status `draft`. It holds 2 nodes.
- Removed: `f-sec-access-cadence`.
- Edited, part 1: `sec-hours`, `p-travel-flights-1`, `p-exp-reimbursement-1`, `f-comms-response`.
- Edited, part 2: `f-tool-grammarly-status`, `f-tool-claude-vendor`, `f-tool-zapier-status`, `f-tool-dropbox-status`.
- Formatting: none.

**v1 to v3**

- Added, top nodes: `cl-sec-credentials`, `cl-tool-cursor`, `sec-remote`.
- Removed, top nodes: `cl-sec-passwords`, `cl-tool-trello`, `f-sec-access-cadence`.
- Moved, reordered and formatting: the same as v1 to v2.
- Edited: the 5 nodes of v1 to v2 and the 8 nodes of v2 to v3.

## Test seams

- `diffDocuments(base, target)` in `src/domain/diff.ts` returns the changes of one comparison.
- `parseInline(text)` in `src/domain/inline.ts` returns safe tokens for one paragraph.
- `pairReplaced(changes)` in `src/domain/pairReplaced.ts` joins a removed and an added node.

`docs/conventions/testing.md` holds the rules for these tests.

## Non-goals

- No editing, no login and no backend.
- No view with the two versions side by side (D1).
- No layout for a phone. The brief asks for a laptop screen.
- No merge of three versions and no history of one node over all versions.
- No "mark as reviewed" state.
- No date in one common format. A date shows as the data holds it.
- No second language.

## Questions for the task owner

The brief allows questions or written assumptions. This work takes the second path.
Each question has the assumption that the app takes.

1. Who is the reader? Assumed: a team member who knows an older version.
2. What does the reader do after the review? Assumed: share one change. A confirmation step comes next.
3. Is each version a full snapshot? Assumed: yes, as in the mock data.
4. Can a node keep its meaning and get a new id? Assumed: yes, so the app labels a likely rename.
5. Does a change of whitespace or number format matter to a reader? Assumed: no, but the reader can inspect it.
6. What does the status `draft` mean? Assumed: the clause is not yet in force.
7. Is the inline markup trusted? Assumed: no.
8. Is the format of a date part of the content? Assumed: yes, so the app does not change it.
