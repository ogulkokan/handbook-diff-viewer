# Skills in this repository

No skill set is installed here (D12). Each skill below is written for this repository.
A skill is short. It says when it applies and which file holds the rules.

## Sources

Each link goes to the exact commit that was read. The rules for each skill are in `docs/conventions/`.

| Skill | Rules | Source | License |
|---|---|---|---|
| `web-platform` | `web-platform.md` | [GoogleChrome/modern-web-guidance@2b4aa13](https://github.com/GoogleChrome/modern-web-guidance/tree/2b4aa13a72dd47cd135b06ce5abfccd92e19b24f) | Apache-2.0 code, CC-BY-4.0 guides |
| `ui-review` | `ui.md` | [nextlevelbuilder/ui-ux-pro-max-skill@cc7b20d](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/cc7b20d85d64d8fa022292cfad731995d3cd4eeb) | MIT |
| `plain-english` | `writing.md` | [danyuchn/asd-ste100-skill@d714e53](https://github.com/danyuchn/asd-ste100-skill/tree/d714e5364e16825dbb6fe7194671d6a435e9fb3f) | MIT |
| `tdd` | `testing.md` | [mattpocock/skills@d653911](https://github.com/mattpocock/skills/tree/d65391149dbb5fe76478e76fa8d5122b2aa5a70e), skill `tdd` | MIT |
| `vue-components` | `vue.md` | [vuejs-ai/skills@198f0cd](https://github.com/vuejs-ai/skills/tree/198f0cd8f7f9c0a3d9b566ccc16de6677519ee78) | MIT |

## What was kept and what was dropped

| Skill | Kept | Dropped | Why |
|---|---|---|---|
| `web-platform` | The Baseline target, and the search and retrieve steps | The plugin in the repository | The guides change. The command reads the current guide |
| `web-platform` | The rule to name the guide in the commit | The scan for old code | This repository has no old code |
| `ui-review` | The web rules and two product rows for document tools | The search script and its data files | They need Python and add about 190 files |
| `ui-review` | Contrast, focus, keyboard and token rules | The native app, chart and motion rules | The app is a desktop reading tool |
| `ui-review` | Nothing from its Vue rows | The Vue rows | `vuejs-ai/skills` is the closer source for Vue |
| `plain-english` | The structure rules and the two modes | The word dictionary | The source does not hold it, and it cannot be shared |
| `plain-english` | The linter, as a step of the gate | The linter file in the repository | The gate reads it from the pinned commit |
| `tdd` | Name the seam, one test, then its code | The issue tracker and the decision folder | A card and `docs/DECISIONS.md` do that work here |
| `vue-components` | Reactivity, data flow, component, composable and test rules | Router, Pinia, Options API, JSX and server rendering | The app uses none of them |
| `vue-components` | The Vue 3.5 rules for props, template refs and watcher cleanup | Two rules that the Vue docs do not support | `docs/conventions/vue.md` names both |

## Looked at and not used

| Source | Why |
|---|---|
| [vueuse/vueuse@6680e57](https://github.com/vueuse/vueuse/tree/6680e578f1499c2071dcbf2c8e94dd0aa235745c), skill `vueuse-functions` | It tells the agent to prefer VueUse to custom code. This repository asks for a reason for each dependency (D8) |
| `@vueuse/core` itself | Each need was checked. The result is in `docs/conventions/vue.md` |

## The owner's own skills

| Skill | What it does |
|---|---|
| `pr-gate` | Runs the gate in the order of CI and reports one row for each step |
| `git-commit` | Writes a commit: explicit paths, an imperative subject, a body that says why |

Both come from the owner's other projects, cut to what this repository needs.

## The reviewer

`.claude/agents/code-reviewer.md` is a read-only agent. It reviews the changes of a card before the pull request.
