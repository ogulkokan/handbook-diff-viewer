# Vue

Adapted from `vuejs-ai/skills` at commit `198f0cd` (MIT). Rewritten for this repository.

The source is a community project. It is not a project of the Vue team.
Taken: the rules for reactivity, data flow, components, composables and tests that fit this app.
Not taken: the rules for the router, Pinia, the Options API, JSX and server rendering.

Two rules of the source are left out on purpose.

- "Use `shallowRef` for each primitive value." The Vue docs teach `ref`, and a primitive has nothing deep to track.
- "`useTemplateRef` does not work with `v-for`." This repository could not confirm it.

## Components

1. Use `<script setup lang="ts">` in each component. One style is easier to review.
2. Type props and emits by type: `defineProps<{ node: DocNode }>()`. An error shows at compile time.
3. Destructure props, with defaults where needed. Pass `() => prop` to `watch` or to a composable.
4. Never change a prop. Emit an event. Data goes down, and events go up.
5. A recursive component refers to itself by its file name. Do not import another component with that name.
6. Give a list child a boolean, such as `:active="id === activeId"`. Do not give it the id.
7. Use `useTemplateRef` for a single element. A wrong name shows as an error.
8. Give each list item a stable key from its node id. Never use the index.
9. On `<template v-for>`, put the key on the `<template>` element.
10. Never put `v-if` and `v-for` on the same element. Filter in a `computed`.
11. Never use `v-html` (D7).

Rule 6 has a reason that is easy to miss. When the id changes, each child with the id prop renders again.
With a boolean, only the two children whose value changed render again.

## State

12. Hold a parsed document in `shallowRef`. Replace the whole value. Never change it in place.
13. Use `computed` for each value that comes from other state: the comparison, the change list, the counts.
14. Keep a `computed` getter pure. A side effect goes into a watcher.
15. Load data with `watch(source, load, { immediate: true })`. Do not call the loader twice.
16. Use `ref` for small state such as a flag or a selected id.

## Composables

17. Name a composable `useX`. Return refs, not a `reactive` object.
18. Return a ref as read-only when a change must go through an action.
19. The engine in `src/domain/` stays plain functions. It is not a composable. A composable calls it.
20. Clean up where you set up: `onUnmounted` for a listener or an observer, `onWatcherCleanup` in an async watcher.

## Styles

21. Use `<style scoped>` with class selectors.
22. Keep the reset and the tokens in `src/styles/`. They are the only global styles.

## Performance

23. Measure first. Do not add `v-memo` or `v-once` without a measured need.
24. Do not wrap each list item in an extra component that only passes props.

## Component tests

- Use `mount`. Test what a reader sees, not how the component holds its state.
- Find an element by its role or its text.
- `await` each `trigger()` call.
- happy-dom has no layout. It cannot check focus, scroll or styles. Use a browser for those.

## VueUse is not a dependency

The app needs few browser helpers, and D8 keeps `vue` as the only runtime dependency.
Each need was checked against the VueUse function for it, at `vueuse/vueuse` commit `6680e57`.

| Need | Function | Why it is not used |
|---|---|---|
| State in the address bar | `useUrlSearchParams` | Values are untyped, and a flag comes back as the string `'true'` |
| Copy a link | `useClipboard` | It reports "copied" when the copy failed |
| Announce a count | `useLiveAnnouncer` | It adds its own element. One `role="status"` element in the template is enough |
| Mark the section in view | `useIntersectionObserver` | It fits, and it saves about 8 lines. That is too little for a dependency |

Add `@vueuse/core` when the hand-written code for one need grows past about 40 lines.
Then add one function, update D8, and add one line to `README.md`.
