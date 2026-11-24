# Progress

A session reads **Current focus** and nothing else from this file. The log is for people.

Keep "Current focus" at four lines. Add one log line for each merged card, newest first.
Say what changed, not what was tried.

## Current focus

- **Now:** Paragraph markup shows as bold and links. Nothing from the data reaches the page as HTML.
- **Prev:** Card 005, safe inline markup.
- **Next:** Card 006, `docs/cards/006-find-changes.md`.
- **Last updated:** 2026-11-24

## Log

- **Card 005** (2026-11-24): `parseInline` reads markup into tokens with an allowlist. An edited paragraph keeps its bold and links.
  The `img` with a handler in version 3 never reaches the page. Built test first, 122 tests.

- **Card 004** (2026-11-24): two version pickers, a mark on each change, a change list that jumps, counts in the outline.
  Formatting changes are hidden and counted. Light and dark colours pass a contrast test. 100 tests.

- **Card 003** (2026-11-24): `diffDocuments` reports added, removed, edited, moved and reordered nodes in document order.
  Formatting changes have their own flag. `diffWords` marks the words that changed. Built test first, 50 tests.

- **Card 002** (2026-11-24): the three versions load and pass a shape check. The document shows with real headings.
  The outline jumps to a section or a clause and marks the section in view.

- **Card 001** (2026-11-24): Vue 3.5, Vite 8 and TypeScript 6 with strict checks. One gate of six steps, and CI that runs it.
  Lint stops `v-html` and stops a Vue import in `src/domain/`.

- **Template** (2026-11-24): the brief and the data as delivered, the agent rules, the spec, 13 decisions, 9 cards.
