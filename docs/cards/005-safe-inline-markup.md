---
id: "005"
title: Paragraph markup shows as bold and links, and nothing from the data runs
branch: feat/safe-inline-markup
touches:
  - src/domain/inline.ts
  - src/domain/inline.test.ts
  - src/domain/textDiff.ts
  - src/components/InlineText.vue
  - src/components/NodeParagraph.vue
  - src/App.test.ts
depends_on: ["004"]
docs:
  - docs/DECISIONS.md
  - docs/conventions/web-platform.md
  - .claude/skills/tdd/SKILL.md
---

# Card 005: safe inline markup

Version 3 holds a paragraph with a link and with an `img` element that tries to run code. This card serves US8.

## Before the code

Read the guide `sanitize-untrusted-html` with the steps in `.claude/skills/web-platform/SKILL.md`.
If the guide points away from D7, stop and write `## Decision needed` in this card.

## In scope

- `parseInline(text)`: text with markup becomes a list of tokens. A token has a text, a bold flag and a link address.
- `b` and `strong` set the bold flag. `a` sets the address, only for `http` and `https`.
- Any other element is dropped. Its text stays.
- `InlineText.vue` renders tokens as text nodes. A link gets `rel="noopener noreferrer"`.
- The word comparison of an edited paragraph runs on tokens, so bold and links stay.
- One mount test of the app.

## Out of scope

- Lists, tables, images and any block markup. `data/README.md` says "inline markup".

## Acceptance

- **A1** The tokens of `p-exp-reimbursement-1` in v3 hold no `img` and keep the link. Proof: a unit test.
- **A2** A link with a `javascript:` address becomes plain text. Proof: a unit test.
- **A3** The `<b>30 days</b>` of the same paragraph renders as bold. Proof: a unit test of the tokens.
- **A4** The app on v2 to v3 shows the right change count, and the page holds no `img` element. Proof: a mount test.
- **A5** v2 to v3 marks the new link words as added and keeps them a link. Proof: browser check.
- **A6** The browser console shows no "unsafe render" message. Proof: browser check.
- **A7** No file in `src/` uses `v-html`. Proof: the lint step.

## Open decisions

- None known.

## Handoff

- **Gate:**

  | Step | Result | Detail |
  |---|---|---|
  | Type check | PASS | |
  | Lint | PASS | `vue/no-v-html` is an error. No file in `src/` uses it |
  | Format check | PASS | |
  | Unit tests | PASS | 122 of 122 |
  | Build | PASS | |
  | Prose lint | PASS | 0 hard findings |

- **Review:** approved. No finding at a confidence of 80 or more.
  The reviewer acted as an attacker who controls the data. It tried about 60 inputs and found no path to code that runs.
  Three of its inputs are now unit tests: a `javascript:` address in mixed case, with a tab, and as a character reference.
- **Before the code:** the guide `sanitize-untrusted-html` was read. It gives `setHTML()` for HTML that goes into the page.
  That API is not Baseline Widely available (D9). This app puts no HTML into the page, so D7 stays.
  D7 now names the Sanitizer API as a rejected option. This is a note, not a change of the decision. The owner confirms it.
- **Measured:**
  - A1: unit test. The tokens of `p-exp-reimbursement-1` in v3 hold no `<`, no `onerror` and no `unsafe render`.
  - A2: unit tests. A link with a `javascript:`, `data:` or relative address becomes plain text.
  - A3: unit test. `30 days` is a bold token.
  - A4: mount test. v2 to v3 shows "10 changes", and the page holds no `img` element and no `onerror`.
  - A5: mount test and browser. `expenses portal` is a link inside an `<ins>`, with the address from the data.
  - A6: browser at 1280 by 720 pixels. The console shows no "unsafe render" message and no error.
  - A7: the lint step passes, and a search of `src/` for `v-html` and `innerHTML` finds nothing.
  - Order: test commit, code commit, test commit, code commit.
- **Not measured:**
  - A real browser for the claim that a `DOMParser` document runs nothing. The reviewer measured it in jsdom.
    For a browser it follows from the HTML standard.
  - Markup with more than 2,000 levels of nesting. In jsdom, 20,000 levels stop the parser with an error.
- **Left:**
  - A link to any `http` or `https` address is allowed, also one with a user name in it. The rule is about code, not about trust in a site.
  - A node id from the data becomes an element id. An id such as `changes-heading` would be a duplicate id. Nothing runs from it.
  - `diffDocuments` now needs a DOM, because the text of an edited paragraph goes through `DOMParser`.
  - `src/domain/text.ts` is gone. `parseInline` replaces it.
