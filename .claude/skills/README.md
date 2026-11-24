# Skills in this repository

No skill set is installed here (D12). Each skill below is written for this repository.
A skill is short. It says when it applies and which file holds the rules.

## Adapted from outside sources

| Skill | Source | Commit | License |
|---|---|---|---|
| `web-platform` | `GoogleChrome/modern-web-guidance` | `2b4aa13` | Apache-2.0 code, CC-BY-4.0 guides |
| `ui-review` | `nextlevelbuilder/ui-ux-pro-max-skill` | `cc7b20d` | MIT |
| `plain-english` | `danyuchn/asd-ste100-skill` | `d714e53` | MIT |
| `tdd` | `mattpocock/skills`, skill `tdd` | `d653911` | MIT |

## What was kept and what was dropped

| Skill | Kept | Dropped | Why |
|---|---|---|---|
| `web-platform` | The Baseline target, and the search and retrieve steps | The plugin in the repository | The guides change. The command reads the current guide |
| `web-platform` | The rule to name the guide in the commit | The scan for old code | This repository has no old code |
| `ui-review` | The web rules and the Vue rows | The search script and its data files | They need Python and add about 190 files |
| `ui-review` | The two product rows for document tools | The native app, chart and motion rules | The app is a desktop reading tool |
| `plain-english` | The structure rules and the two modes | The word dictionary | The source does not hold it, and it cannot be shared |
| `plain-english` | The linter, as a step of the gate | The linter file in the repository | The gate reads it from the pinned commit |
| `tdd` | Name the seam, one test, then its code | The issue tracker and the decision folder | A card and `docs/DECISIONS.md` do that work here |

## The owner's own skills

| Skill | What it does |
|---|---|
| `pr-gate` | Runs the gate in the order of CI and reports one row for each step |
| `git-commit` | Writes a commit: explicit paths, an imperative subject, a body that says why |

Both come from the owner's other projects, cut to what this repository needs.

## The reviewer

`.claude/agents/code-reviewer.md` is a read-only agent. It reviews the changes of a card before the pull request.
