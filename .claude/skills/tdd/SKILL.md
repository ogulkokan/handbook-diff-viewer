---
name: tdd
description: Use when a card changes src/domain - the diff engine, the markup parser or the replaced-pair rule. Runs the test-first loop - name the seam, write one failing test, commit it, write the code, commit it.
---

# Test first

Adapted from the `tdd` skill of `mattpocock/skills` at commit `d653911` (MIT).

The rules are in `docs/conventions/testing.md`. Read that file first.

## Steps

1. Name the seam: the one public function that the test calls. `docs/SPEC.md` lists the seams.
2. Take the expected value from "Expected changes" in `docs/SPEC.md`. Write the node id in the test.
3. Write one test for one behaviour. Use the real files in `data/`.
4. Run the test. It must fail, and the failure must name the missing behaviour.
5. Commit the test alone.
6. Write the least code that passes. Run all tests.
7. Commit the code.
8. Go to step 2 for the next behaviour.

## Limits

- Never take an expected value from the output of the code under test.
- Do not write all tests before the code. One test, then its code.
- Do not refactor in the loop. The review names what to clean.
- Do not test a component with this loop. A browser check covers components.
- If the data and the spec disagree, stop. Write `## Decision needed` in the card.
