---
name: vue-components
description: Use when you write or change a .vue file or a composable in src/composables. Applies the project's rules for props, reactivity, lists, recursive components, cleanup and component tests.
---

# Vue components

Adapted from `vuejs-ai/skills` at commit `198f0cd` (MIT).

The rules are in `docs/conventions/vue.md`. Read that file first.

## Steps

1. Decide where the code belongs. A pure function goes to `src/domain/`. State goes to a composable. A component renders.
2. Write the props and the emits as types before the template.
3. Write each value that comes from other state as a `computed`.
4. For a list, choose the key from the node id. Give each child a boolean, not a shared id.
5. For each listener, observer or async watcher, write its cleanup in the same block.
6. Read the 24 rules once against the finished file.
7. Run the gate. The edit hook already showed the lint findings for the file.

## Limits

- Do not add `@vueuse/core` or another dependency. `docs/conventions/vue.md` says when that changes (D8).
- Do not import Vue in `src/domain/`.
- Do not use `v-html` (D7).
- Do not write a unit test for a component. The mount test and the browser check cover components.
- For HTML and CSS patterns, use the `web-platform` skill. For colour and layout, use `ui-review`.
