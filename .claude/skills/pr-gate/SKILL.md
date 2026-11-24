---
name: pr-gate
description: Use before you open or update a pull request, and when someone asks if a branch can merge. Runs the gate in the order of CI and reports one row for each step - PASS, FAIL or NOT RUN.
---

# PR gate

A card is done only when the gate passes. `CLAUDE.md` defines "done".

## Steps

Run the whole gate with one command. It stops at the first step that fails.

```bash
npm run gate
```

The steps, in order. This list is the whole of `.github/workflows/ci.yml`.

| # | Step | Command |
|---|---|---|
| 1 | Type check | `npm run typecheck` |
| 2 | Lint | `npm run lint` |
| 3 | Format check | `npm run format:check` |
| 4 | Unit tests | `npm test` |
| 5 | Build | `npm run build` |
| 6 | Prose lint | `npm run lint:prose` |

After card 008, also run `npm run test:e2e`.

If you add a step to CI, add it to this list and to `npm run gate` in the same commit.

## Report

Write this table into the pull request body and into the card's Handoff.

| Step | Result | Detail |
|---|---|---|
| Type check | PASS | |
| Unit tests | FAIL | 1 of 14 failed: `marks a moved clause` |
| Build | NOT RUN | The gate stopped at unit tests |

## Limits

- A step that did not run is NOT RUN. Never write PASS for it.
- If a tool is missing, the step is NOT RUN. Say which tool.
- Fix a failure and run the whole gate again. Do not run only the step that failed.
- Do not change a test or a lint rule to make the gate pass. Ask the owner.
