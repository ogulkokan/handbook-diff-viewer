# Writing

Adapted from `danyuchn/asd-ste100-skill` at commit `d714e53` (MIT). Rewritten for this repository.

The source applies the structure rules of ASD-STE100 Simplified Technical English.
It does not hold the ASD dictionary, and this file does not hold it. This is not certified STE.

## Why

A reviewer, a teammate and an agent read this repository. English is a second language for some of them.
Short, literal sentences have one reading. That is the goal.

## Two modes

- **Strict**: `CLAUDE.md`, skills, cards and UI text. A wrong reading has a cost here.
- **Flavoured**: `README.md`, `docs/` and commit bodies. The structure rules apply in full. Word choice is advice.

## Rules

1. Use active voice. Name the actor.
2. Write one instruction in one sentence.
3. Keep an instruction at 20 words or fewer. Keep a description at 25 words or fewer.
4. Use simple tenses. Write `Fixed the outline`, not `Have fixed the outline`.
5. Do not use a semicolon. Write two sentences.
6. Do not use a phrasal verb. Write `start`, not `kick off`. Write `remove`, not `take out`.
7. Use one word for one thing. `GLOSSARY.md` holds the words.
8. Use a verb, not a noun. Write `check the gate`, not `perform a check of the gate`.
9. Do not use sales words such as `seamless`, `robust` or `effortless`.
10. Keep a noun group at 3 words or fewer. Write "the handler that sets the order", not "the order set handler".
11. Keep a hedge that is true. Do not change "may fail" to "fails".
12. Use a list for 3 or more steps or items.

## UI text

UI text is short, and space is small. These rules decide the hard cases.

- Keep the subject and the verb. Write "2 formatting changes are hidden", not "2 formatting changes hidden".
- A badge can be one word from the glossary: Added, Removed, Edited, Moved, Reordered, Replaced, Draft.
- A badge with a place names the place: "Moved from Working Hours".
- A control says what it does: "Show formatting changes", "Next change", "Copy link".
- A count comes with its noun: "8 changes", "1 change".
- Say "likely" where the app guesses: "Replaced, likely renamed".

## Commits

- The subject is an imperative sentence of 72 characters or fewer, with no full stop.
- The body says why. One change in one commit.
- A UI commit names the guide it followed. See `docs/conventions/web-platform.md`.

## The check

`npm run gate` runs the linter of the source on the Markdown files of this repository.
The linter finds semicolons, long sentences, a short list of phrasal verbs and sales words.
It does not find every rule above. A clean result is not proof of good text.
Fix a finding in the text. Do not raise the limit.
