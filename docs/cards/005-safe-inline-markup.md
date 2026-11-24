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
- **Review:**
- **Measured:**
- **Not measured:**
- **Left:**
