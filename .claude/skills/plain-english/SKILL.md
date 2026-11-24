---
name: plain-english
description: Use when you write or change text that a person or an agent reads - README, docs, cards, CLAUDE.md, skills, UI labels and messages, commit bodies. Applies the project's short-sentence rules and its glossary.
---

# Plain English

Adapted from `danyuchn/asd-ste100-skill` at commit `d714e53` (MIT).

The rules are in `docs/conventions/writing.md`. The words are in `GLOSSARY.md`. Read both first.

## Steps

1. Choose the mode. Strict: `CLAUDE.md`, skills, cards and UI text. Flavoured: `README.md`, `docs/` and commit bodies.
2. Write the text.
3. Read each sentence against the 12 rules. Split a sentence that holds two instructions.
4. Replace each word that the glossary lists under "Words to avoid".
5. For UI text, check that each message has a subject and a verb.
6. Run the gate. Its last step runs the linter on the Markdown files.
7. Fix each finding in the text.

## Limits

- Do not make a hedge stronger. "May fail" stays "may fail".
- Do not rewrite `docs/BRIEF.md` or `data/README.md`. They are the task as delivered.
- The linter checks structure only. A clean result does not mean that the text is clear.
- This is not certified Simplified Technical English.
