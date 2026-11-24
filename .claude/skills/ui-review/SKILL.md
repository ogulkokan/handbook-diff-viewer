---
name: ui-review
description: Use before a UI card is done, and when you choose colours, spacing, badges or component structure. Runs the project's UI checklist in a real browser - contrast, colour is never the only signal, focus, keyboard, tokens.
---

# UI review

Adapted from `nextlevelbuilder/ui-ux-pro-max-skill` at commit `cc7b20d` (MIT).

The rules are in `docs/conventions/ui.md`. Read that file first.

## Steps

1. Start the app and open it in a browser at 1280 by 720 pixels.
2. Go through the 12 rules in "Rules in order of weight", from the top.
3. Repeat the check in the dark theme. Do not assume that it passes.
4. Put the mouse away. Reach each control and each change with the keyboard.
5. Check that the top bar never covers the element that has focus.
6. Search the components for a raw colour value. Each colour must be a token.
7. Fix each failure. Then run the checklist again from the top.

## Report

Write one line for each rule in the card's Handoff: the rule, PASS or FAIL, and what you saw.
A rule that you did not check is NOT RUN. Do not report it as a pass.

## Limits

- A screenshot is evidence. A guess from the code is not.
- This skill does not choose a new visual style. The direction is fixed in the convention file.
