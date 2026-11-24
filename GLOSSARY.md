# Glossary

These are the project's own words. Each word has one meaning. Use them in code, UI text and docs.

## The document

- **document**: One tree of nodes with an id, a title and a version number.
- **version**: One snapshot of the document. The data holds versions 1, 2 and 3.
- **node**: One item in the tree. Each node has an `id` and a `type`.
- **section**: A node that holds clauses and, one level deep, other sections.
- **clause**: A node that holds fields and paragraphs. A clause can have a status.
- **field**: A leaf node with a label and a value.
- **paragraph**: A leaf node with text. The text can hold inline markup.
- **leaf**: A field or a paragraph.
- **status**: An optional word on a clause. The data uses `draft`.

## The comparison

- **base version**: The older of the two versions. The reader read this one.
- **target version**: The newer of the two versions. The app shows this one.
- **comparison**: One base version and one target version.
- **change**: One difference between the base version and the target version. Each change has one kind.
- **change kind**: One of added, removed, edited, moved, reordered, replaced.
- **added**: The node is only in the target version.
- **removed**: The node is only in the base version.
- **edited**: The node is in both versions, and a title, label, value, text or status differs.
- **moved**: The node is in both versions, and its parent differs.
- **reordered**: The node has the same parent, and its place among its siblings differs.
- **replaced**: A removed node and an added node that are probably the same thing under a new id.
- **formatting change**: An edit that changes only whitespace or the format of a number.
- **change list**: All changes of one comparison, in document order.
- **outline**: The list of sections and clauses that the reader uses to move in the document.

## The work

- **card**: One unit of work that becomes one pull request.
- **gate**: The ordered checks that a card must pass. `npm run gate` runs them.
- **seam**: A boundary where a test calls the code. The diff engine is the main seam.
- **decision**: One entry in `docs/DECISIONS.md`, named `D` and a number.

## Words to avoid

- Do not say "diff" in UI text. Say "change" or "comparison".
- Do not say "noise" in UI text. Say "formatting change".
- Do not say "old" and "new" for versions. Say "base" and "target", or the version number.
- Do not say "modified", "updated" or "altered". Say "edited".
- Do not say "deleted". Say "removed".
