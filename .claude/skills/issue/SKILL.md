---
name: issue
description: Use when the user wants to create a GitHub issue in shop_sznyt_design. Project-scoped override that uses label-based type/priority/triage (no GitHub Project board).
---

# Create GitHub Issue (sznytdesign)

Creates a GitHub issue via the `gh` CLI, assigns it to the current user, and applies the three required label families: **type**, **priority**, **triage**.

This is a project-scoped override of the global `/issue` skill. The global skill targets a different project (LoveStack) with a hardcoded Project board. This repo uses labels only — see `docs/agents/triage-labels.md`.

## Workflow

1. **Collect details** from the user's message or ask if missing:
   - **Title** (required) — concise, imperative ("Add dark mode", "Fix login crash"). PRDs use `PRD:` prefix.
   - **Body** (optional but encouraged) — context, acceptance criteria, links to CONTEXT.md sections where relevant.
   - **Type label** (required) — exactly one of: `bug`, `feature`, `chore`, `docs`, `refactor`, `prd`.
   - **Priority label** (always prompt) — `p0` / `p1` / `p2`, or omit for backlog. If the user does not specify, ask once; default to no priority (backlog) if they decline.
   - **Triage label** — default to `needs-triage` unless the user explicitly says it's ready (then ask: `ready-for-agent` or `ready-for-human`?).
   - **Assignee** — defaults to `@me`.

2. **Create the issue:**

```bash
gh issue create \
  --title "TITLE" \
  --body "BODY" \
  --assignee @me \
  --label "TYPE,PRIORITY,TRIAGE"
```

   - Combine labels comma-separated in a single `--label` flag.
   - Omit a label string if it doesn't apply (e.g. no priority chosen → drop it from the list).
   - For multi-line bodies, use a heredoc:

```bash
gh issue create --title "..." --assignee @me --label "feature,p1,needs-triage" --body "$(cat <<'EOF'
## Context
...

## Acceptance criteria
- [ ] ...
EOF
)"
```

3. **Report back** the issue URL from the command output.

## Quick reference

| Decision                | Label                                                              |
| ----------------------- | ------------------------------------------------------------------ |
| It breaks something     | `bug`                                                              |
| It adds user value      | `feature`                                                          |
| It's plumbing / content | `chore`                                                            |
| It's only docs          | `docs`                                                             |
| It restructures code    | `refactor`                                                         |
| It's a spec, not a task | `prd`                                                              |
| Launch-blocking         | `p0`                                                               |
| Next up                 | `p1`                                                               |
| Nice-to-have            | `p2`                                                               |
| Eventually              | _no priority label_                                                |
| New, unreviewed         | `needs-triage`                                                     |
| Waiting on info         | `needs-info`                                                       |
| AFK-agent ready         | `ready-for-agent`                                                  |
| Human-only              | `ready-for-human`                                                  |
| Blocked externally      | add `blocked` (don't replace triage)                               |

Full reference: `docs/agents/triage-labels.md`.

## Common mistakes

- **Don't** create an issue with no type label — every issue needs exactly one.
- **Don't** auto-assign `p0` unless the user explicitly said "blocker" / "launch-blocking" / "drop everything".
- **Don't** skip the priority prompt. Ask once; if the user declines, omit the label and note it's backlog.
- **Don't** use `--body ""` and expect a meaningful body — ask if context would help first.
- **Do** prefix PRD titles with `PRD:` so they scan visually as well as label-filter.
