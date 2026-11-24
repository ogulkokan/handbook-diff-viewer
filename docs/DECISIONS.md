# Decisions

Each entry is `D` and a number, a claim, and the reasoning: context, decision, what was rejected, consequence.
Code names a decision short, as `(D7)`. A decision changes only when the owner says so.

## D1 — One document view, not two columns

**Context.** The brief does not say how to show differences. The screen is a laptop.
**Decision.** The app shows the target version in reading order and marks each change in place.
**Rejected.** Two versions side by side. Each column gets half the width, and added or removed nodes break the alignment.
**Consequence.** A removed node needs a place in a document that no longer holds it. It shows at its earlier place, struck through.

## D2 — Any older version against any newer version

**Context.** The brief does not say which versions can be compared.
**Decision.** The base version is older than the target version. The default is the previous version against the latest.
**Rejected.** Only neighbours. A reader who knows version 1 would need two passes to reach version 3.
**Consequence.** The app compares two snapshots directly. A change that a later version undid does not show.

## D3 — Nodes match by id, and a move is one change

**Context.** `data/README.md` says ids are stable unless a node was removed or created.
**Decision.** The same id in both versions is the same node. A new parent makes the node "moved".
**Rejected.** A match by position or by text. Both break on the first inserted node.
**Consequence.** A moved node shows at its new place with "Moved from". Its children are compared as usual.

## D4 — A reorder marks the fewest nodes

**Context.** In `sec-comms`, two clauses swap places. One of them moved. The other stayed.
**Decision.** The longest common order of the shared siblings stays unmarked. The other nodes are "reordered".
**Rejected.** A mark on each node whose index changed. One inserted node would mark all nodes after it.
**Consequence.** A swap marks one node. The reader sees "Reordered" as a small badge.

## D5 — Formatting changes are hidden, counted and open to inspection

**Context.** The data holds an edit that changes only spaces, and `1,000 EUR` against `1000 EUR`.
**Decision.** These are formatting changes. The app hides them by default, shows their count, and one control shows them.
**Rejected.** To drop them without a trace. A reader cannot trust a tool that hides things and does not say so.
**Rejected.** To show them as edits. Two of the changes from version 1 to version 2 would be noise.
**Consequence.** The rule for "formatting" is short and written in `docs/SPEC.md`. A date in a new format is a real edit.

## D6 — A likely rename is labelled as a guess

**Context.** `cl-sec-passwords` becomes `cl-sec-credentials`: a new id, the same place, and one word of text differs.
**Decision.** A removed node and an added node pair as "replaced" under three conditions.
They have the same parent and the same type, and the text of their leaves is at least 80% alike.
**Rejected.** A match on labels. Trello and Cursor have the same labels and are different tools.
**Consequence.** The UI says "Replaced, likely renamed". The schema says a new id is a new node, so the app does not claim more.

## D7 — Inline markup becomes tokens, never HTML

**Context.** Paragraph text can hold markup. Version 3 holds an `img` element with an `onerror` handler.
**Decision.** `DOMParser` reads the text into a document that runs nothing.
A walk over that document makes tokens with a text, a bold flag and a link address.
Vue renders the tokens as text. Only bold and `http` or `https` links keep their format.
**Rejected.** DOMPurify and one `v-html`. A word comparison on an HTML string cuts tags in two.
**Rejected.** The Sanitizer API with `setHTML()`. The browser guide `sanitize-untrusted-html` gives it for HTML that goes into the page.
It is not Baseline Widely available (D9), and its fallback in the guide is DOMPurify.
This app puts no HTML into the page, so it needs no sanitizer.
**Consequence.** ESLint treats `v-html` as an error. Markup beyond bold and links shows as plain text.

## D8 — The only runtime dependency is Vue

**Context.** The brief asks for a reason for each dependency. The state is two versions and one selected change.
**Decision.** No store, no router, no UI kit, no CSS framework and no comparison library.
One function for the longest common subsequence serves the word comparison and the reorder rule.
**Rejected.** The `diff` package. It is a fair choice, but the function is 31 lines of code and has tests.
**Rejected.** `@vueuse/core`. Each need was checked against its function, and the table is in `docs/conventions/vue.md`.
Two functions hide a result that this app must show, and the one that fits saves about 8 lines.
**Consequence.** If the word comparison reads badly in the browser, `diff` replaces the function in one commit.
If the code for one browser need grows past about 40 lines, one VueUse function replaces it, with a line in `README.md`.

## D9 — Baseline Widely available

**Context.** The reviewer can use any current desktop browser.
**Decision.** The app uses only features that are Baseline Widely available.
**Rejected.** Newer features with fallbacks. Each fallback is code to write and test in a short time box.
**Consequence.** `docs/conventions/web-platform.md` lists the features that the app does not use.

## D10 — Unchanged content folds and stays in the page

**Context.** `sec-tools` has 40 clauses. A comparison changes 5 of them at most.
**Decision.** "Changes only" folds each run of unchanged nodes into one closed `<details>` element.
**Rejected.** To remove unchanged nodes from the page. Find-in-page would not find them.
**Consequence.** The summary of the fold says how many nodes it holds.

## D11 — No attribution lines

**Context.** The owner's projects carry no tool footer in commits or pull requests.
**Decision.** Commits and pull requests have no attribution line. `.claude/settings.json` sets this.
**Rejected.** A trailer on each commit. The use of AI is stated once, in `README.md` and in `CLAUDE.md`.
**Consequence.** `README.md` has a section on how the work was done with an agent.

## D12 — Outside guidance is distilled, not installed

**Context.** Five public skill sets have rules that fit this app. One of them installs about 190 files.
**Decision.** Each source becomes one file in `docs/conventions/` and one thin skill that points to it.
**Rejected.** To install the sets. Most of their content is for other kinds of work.
**Consequence.** `.claude/skills/README.md` links each source at the commit that was read.
It says what was kept and what was dropped, and it lists the sources that were read and not used.

## D13 — TypeScript 6, not 7

**Context.** TypeScript 7.0 is the newest release. `typescript-eslint` 8.74 accepts versions below 6.1 only.
**Decision.** The project uses the newest TypeScript 6.0 release.
**Rejected.** TypeScript 7 without the lint rules for TypeScript. The lint step is part of the gate.
**Consequence.** The version rises when `typescript-eslint` supports the new major.
