---
id: pa-91cb
status: closed
deps: []
links: []
created: 2026-02-17T20:38:52Z
type: bug
priority: 1
assignee: Alexander Mangel
tags: [coding-agent, rlm, bug]
---
# Fix Bun runtime crash in RLM mode due to node:repl import shape

`pi --rlm` crashes at runtime with `TypeError: repl.start is not a function` under Bun. Update imports to namespace form compatible with Bun's Node module interop.



## Goal
Make `pi --rlm` start successfully under Bun runtime.

## Acceptance Criteria
- [ ] RLM mode uses compatible import for node:repl
- [ ] Type checking/check passes

## Verification
- [ ] Run bun run check

## Worktree
- .
