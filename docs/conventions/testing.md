# Testing

The test-first loop is adapted from the `tdd` skill of `mattpocock/skills` at commit `d653911` (MIT).
The test budget comes from the owner's own projects. Rewritten for this repository.

## Why a test exists

A test guards one of three things.

- An acceptance criterion of a card.
- An invariant, such as "the app never renders an `img` from the data".
- A bug that really happened.

A test that stays green when its change is reverted protects nothing. Remove it.

## Where the expected value comes from

The expected value comes from the data table in `docs/SPEC.md`, which was counted by hand from the JSON files.
It never comes from the output of the code under test.
A test that copies today's output proves only that the code did not change.

## Seams

A seam is a boundary where a test calls the code. Name the seam before the first test.

| Seam | Module | Test first |
|---|---|---|
| Diff engine | `src/domain/diff.ts` and its helpers | Yes |
| Markup parser | `src/domain/inline.ts` | Yes |
| Replaced pairs | `src/domain/pairReplaced.ts` | Yes |
| Colour tokens | `src/styles/tokens.css` | One contrast test |
| The app as a whole | `src/App.vue` | One mount test, one Playwright smoke test |

Components have no unit tests of their own. A browser check covers them, and the card records it.

## The loop

1. Write one test for one behaviour. Run it. It must fail for the right reason.
2. Commit the test.
3. Write the least code that passes the test. Run all tests.
4. Commit the code.
5. Repeat for the next behaviour.

Do not write all tests first. Do not refactor inside the loop. The review finds what to clean.

## Rules

- Test behaviour through the public function. Never assert a private value or the order of calls.
- Use the real data files as fixtures. They hold the cases that the brief hides.
- Name a test after the behaviour: "marks a clause that changed its parent as moved".
- One invariant check is worth more than many example tests.
- Do not write an assertion that passes for almost any output.
- A number in a test comes from the data table, with the node id next to it.

## Budget

- Each acceptance criterion gets one test of the result that a reader can see.
- The app gets one mount test and one smoke test.
- A test beyond the budget names the bug that it catches.
