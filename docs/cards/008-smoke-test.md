---
id: "008"
title: One browser test proves that the main path works
branch: test/smoke
touches:
  - e2e/**
  - playwright.config.ts
  - package.json
  - package-lock.json
  - .github/workflows/ci.yml
depends_on: ["006"]
docs:
  - docs/conventions/testing.md
---

# Card 008: smoke test

Stretch card. It is the second card to cut if the time box ends.

The unit tests prove the engine. One test in a real browser proves that the parts work together.

## In scope

- Playwright as a dev dependency, with Chromium only.
- One test in `e2e/smoke.spec.ts`:
  1. Open the app. The default comparison shows.
  2. Choose version 1 as the base version. The change count grows.
  3. Click one entry in the change list. Its mark is in view.
  4. The page holds no `img` element, and the console has no "unsafe render" message.
- The script `test:e2e`. It builds the app and runs the test against the preview server.
- A CI step for the test.

## Out of scope

- More than one browser. More than one test.

## Acceptance

- **A1** `npm run test:e2e` passes on the owner's machine. Proof: the command output.
- **A2** The test fails when `InlineText.vue` renders an `img`. Proof: one run with a change that is not committed.
- **A3** CI runs the test, or the pull request says why it is NOT RUN. Proof: the CI run.

## Open decisions

- None known.

## Handoff

- **Gate:**
- **Review:** not needed for this card.
- **Measured:**
- **Not measured:**
- **Left:**
