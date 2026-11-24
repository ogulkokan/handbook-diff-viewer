---
name: git-commit
description: Use each time you commit in this repository. Keeps commits small, with explicit paths, an imperative subject, a body that says why, and no attribution line.
---

# Git commit

## Hard rules

- Add no attribution line: no `Co-Authored-By` and no tool footer (D11).
- Stage explicit paths. Never use `git add -A` or `git add .`.
- Never commit on `main`. After the template, each commit is on a card branch.
- Never amend a commit that is pushed. Never force a push.
- One logical change in one commit.
- In a test-first card, commit the test before the code.

## Message

- **Subject:** an imperative sentence, 72 characters or fewer, a capital first letter, no full stop.
- **Body:** say why, and what a reader cannot see in the change. Wrap at 72 columns.
- A UI commit names its guide: `Guide: <guide-id>`.
- Cite a decision short: `(D7)`.
- End with what you checked: `Checked: gate passes.` or `Not checked: dark theme.`

## Steps

1. Run `git status --short`. Read what changed.
2. Stage the paths of one change: `git add <path> <path>`.
3. Run `git diff --cached --stat`. Check that only that change is staged.
4. Commit with a message from a file or a heredoc.
5. Run `git log --oneline -3`.

## Example

```text
Mark a clause that changed its parent as moved

A node with the same id under a new parent was reported as removed
and added. The reader saw two changes for one move (D3).

Checked: gate passes.
```
