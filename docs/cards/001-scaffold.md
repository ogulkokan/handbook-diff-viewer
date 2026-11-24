---
id: "001"
title: A Vue 3 project that starts, and a gate that runs
branch: chore/scaffold
touches:
  - package.json
  - package-lock.json
  - "*.config.*"
  - tsconfig*.json
  - index.html
  - src/**
  - scripts/**
  - .github/workflows/ci.yml
  - .gitignore
depends_on: []
docs:
  - docs/DECISIONS.md
  - .claude/skills/pr-gate/SKILL.md
---

# Card 001: scaffold

The build needs a project that starts and one command that says if a change is good.

## In scope

- Make the project with `npm create vue@latest`: TypeScript, Vitest, ESLint, Prettier. Read `--help` for the flags first.
- Keep the versions that the tool writes. Then run `npm outdated` and raise a package only inside its peer ranges.
- Turn on strict TypeScript. Set `engines.node` to `>=22.18`.
- Make `vue/no-v-html` an error in the ESLint config.
- Add the scripts `typecheck`, `lint`, `format:check`, `test`, `build`, `lint:prose` and `gate`.
- Add `scripts/ste-lint.sh`. It reads the linter from the pinned commit and checks its SHA-256.
- Add `.github/workflows/ci.yml`. It runs `npm ci` and `npm run gate` on a pull request into `develop` or `main`.
- Remove the demo components that the tool writes. Leave one page that says the app name.

## Out of scope

- Any type, loader or component of the app. Card 002 builds them.
- Playwright. Card 008 adds it.

## Acceptance

- **A1** `npm install` and `npm run dev` start the app. Proof: the page opens in the browser.
- **A2** `npm run gate` runs six steps in order and passes. Proof: the gate table.
- **A3** A component with `v-html` fails the lint step. Proof: a file that is not committed.
- **A4** The edit hook reports an ESLint finding with exit code 2. Proof: one run of the hook by hand.
- **A5** CI uses `runs-on: ${{ vars.CI_RUNNER || 'ubuntu-latest' }}`, read-only permissions and one run for each branch.
- **A6** TypeScript is 6.0 (D13). Vue is 3.5. Vite is 8. Proof: `npm ls` for the three.

## Open decisions

- None known.

## Handoff

- **Gate:**

  | Step | Result | Detail |
  |---|---|---|
  | Type check | PASS | `vue-tsc --build`, strict |
  | Lint | PASS | `eslint .` |
  | Format check | PASS | `prettier --check .` |
  | Unit tests | PASS | 1 of 1 |
  | Build | PASS | `vite build` |
  | Prose lint | PASS | 0 hard findings |

- **Review:** not needed for this card.
- **Measured:**
  - A1: `npm ci` and `npm install` pass on npm 10.9.7. The page opens and shows the app name. The console has no error.
  - A2: `npm run gate` passes with the six steps above.
  - A3: a component with `v-html` gives `vue/no-v-html` as an error.
  - A4: the edit hook exits with 2 on that component and with 0 on `src/App.vue`.
  - A6: `npm ls` shows Vue 3.5.46, Vite 8.3.8 and TypeScript 6.0.3.
  - A file in `src/domain/` that imports `vue` fails the lint step.
  - A5: the first CI run on this pull request passes in 47 seconds. It runs `npm ci` and `npm run gate`.
- **Not measured:**
  - Nothing is open.
- **Left:**
  - The lock file must stay in the repository. npm 10 cannot resolve this tree from `package.json` alone.
  - Vitest is 4.1, as `create-vue` wrote it. Vitest 5 is a new major and is not used.
  - The test environment is jsdom, as `create-vue` wrote it.
  - `npm audit` reports 5 moderate findings. All are in dev dependencies, through `@vue/test-utils`.
  - Tests sit next to the code as `*.test.ts`.
  - CI uses `actions/checkout@v7` and `actions/setup-node@v7`. Version 4 of both gave a warning about its Node runtime.
