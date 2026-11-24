# handbook-diff-viewer

A small Vue 3 app. A reader opens a structured document and sees what changed between two versions.

**Status:** the app is not built yet. This branch holds the task as delivered and the plan for the build.
Card 009 replaces this file with the full README.

## Where to look

| File | What it holds |
|---|---|
| `docs/BRIEF.md` | The task, unchanged |
| `data/` | The three versions of the document, unchanged |
| `docs/SPEC.md` | The reader, the change kinds, and what the data holds |
| `docs/DECISIONS.md` | Each decision, with what was rejected |
| `docs/cards/` | The build, cut into nine cards with acceptance criteria |
| `CLAUDE.md` | The rules for an agent that works here |
| `docs/conventions/` | The rules for writing, the web platform, UI and tests |
| `.claude/` | The settings, the edit hook, the skills and the reviewer |
| `PROGRESS.md` | What is done and what is next |

## How the work goes

1. `main` holds the template first. `develop` starts from it.
2. Each card is one branch and one pull request into `develop`.
3. A card is done when its gate passes and its review is clean.
4. One pull request from `develop` into `main` delivers the app.
