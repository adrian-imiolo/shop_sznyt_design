# Labels reference

Every open issue should carry **one of each** of the three label families below: **type**, **priority**, and **triage**. (Blocked issues are a temporary exception — see below.)

> Filename kept as `triage-labels.md` for backwards compatibility with existing skills. Scope has grown to cover all label families.

## Type labels — what *kind* of issue is this?

Exactly one of:

| Label      | Meaning                                                                   |
| ---------- | ------------------------------------------------------------------------- |
| `bug`      | Something isn't working                                                   |
| `feature`  | New user-facing capability                                                |
| `chore`    | Maintenance, setup, content, infra — no user-facing feature               |
| `docs`     | Documentation only                                                        |
| `refactor` | Code restructuring without behavior change                                |
| `prd`      | Product spec that produces issues — **not an issue itself**. PRDs describe a goal and spawn child issues. Pair with `ready-for-agent` once triaged. |

## Priority labels — when does this get worked on?

At most one of:

| Label | Meaning                                                                  |
| ----- | ------------------------------------------------------------------------ |
| `p0`  | Drop everything — production-blocking or launch-blocking                 |
| `p1`  | Next up — important but not blocking                                     |
| `p2`  | Soon — nice to have, can wait                                            |
| _none_ | Backlog. Not scheduled. Re-triage when work picks up.                   |

Solo-founder rule: three tiers is the ceiling. Resist adding `p3`/`p4` — unlabeled-as-backlog keeps the noise down.

## Triage labels — what state is this in?

Exactly one of:

| Triage role        | Label             | Meaning                                  |
| ------------------ | ----------------- | ---------------------------------------- |
| `needs-triage`     | `needs-triage`    | Maintainer needs to evaluate this issue  |
| `needs-info`       | `needs-info`      | Waiting on reporter for more information |
| `ready-for-agent`  | `ready-for-agent` | Fully specified, ready for an AFK agent  |
| `ready-for-human`  | `ready-for-human` | Requires human implementation            |
| `wontfix`          | `wontfix`         | Will not be actioned                     |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding label string from this table.

## Status modifiers

| Label     | Meaning                                                                  |
| --------- | ------------------------------------------------------------------------ |
| `blocked` | Cannot proceed due to external dependency. Pair with type label; priority may be omitted until unblocked. |

## Workflow

1. **Creation**: assign `type` + `priority` (default `p2` if nothing else fits) + `needs-triage`.
2. **Triage**: replace `needs-triage` with one of `needs-info` / `ready-for-agent` / `ready-for-human` / `wontfix`.
3. **PRD → issues**: a `prd` issue spawns multiple child issues via the `to-issues` skill. The PRD itself stays open as the parent until all children are closed.
