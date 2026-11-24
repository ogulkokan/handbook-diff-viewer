# Web platform

Adapted from `GoogleChrome/modern-web-guidance` at commit `2b4aa13`.
The code is Apache-2.0 and the guides are CC-BY-4.0. Rewritten for this repository.

This project's Baseline target is Baseline Widely available.

## Why

The reviewer can open the app in any current desktop browser. A feature that one browser lacks breaks the review.
A native element also gives keyboard and screen reader support that hand-written code must rebuild.

## How to look for a guide

Read the guide before you build a UI pattern. Do not write the pattern from memory.

```bash
DISABLE_TELEMETRY=1 npx -y modern-web-guidance@latest search "sticky header"
DISABLE_TELEMETRY=1 npx -y modern-web-guidance@latest retrieve "state-aware-sticky-headers"
```

- Leave the framework name out of the search.
- The guides use plain HTML, CSS and JavaScript. Adapt them to Vue and keep the native feature.
- Each guide states the Baseline status of its features. Use a feature only if it is Widely available.
- For a feature that is not Widely available, use the fallback that the guide gives.
- Name the guide id in the commit body: `Guide: state-aware-sticky-headers`.

## Chosen features

| Need | Feature | Guide |
|---|---|---|
| A section or clause that folds | `<details>` and `<summary>` | `accordion` |
| Folded text that find-in-page still finds | A closed `<details>` | `search-hidden-content` |
| An outline that follows the scroll position | `IntersectionObserver` and `aria-current` | `scrollspy` |
| A top bar that stays in view | `position: sticky`, one row | `content-first-noise-reduction` |
| A jump target that the top bar does not cover | `scroll-padding-top` | `state-aware-sticky-headers` |
| A move to the next change | `scrollIntoView`, then `focus({ preventScroll: true })` | `scroll-completion-effects` |
| Light and dark theme | `color-scheme` and `prefers-color-scheme` | `dark-mode` |
| A copy of a link | `navigator.clipboard.writeText` and a `role="status"` message | `copy-button` |
| Text from the data that holds markup | Tokens, never HTML | `sanitize-untrusted-html` |

## Rules for Vue

- Do not fold text with `v-if` or `v-show`. Both take the text away from find-in-page.
- The browser opens and closes a `<details>` element itself. Bind `:open` and listen to `@toggle`.
- Give a jump target `tabindex="-1"`, so that it can take focus.
- Sync `aria-current` in the outline when the scroll ends.
- Do not put text that has meaning into CSS `content`. A screen reader can skip it.

## Not used

These features are not Widely available. The app does not use them.

- `hidden="until-found"`
- `popover="hint"` and `interestfor`
- `command` and `commandfor`
- `scroll-target-group` and `scroll-state()`
- View transitions
- `<input type="checkbox" switch>`
- `light-dark()`, `interpolate-size` and `::details-content`

A plain checkbox, a `title` attribute and an instant open are the replacements.
