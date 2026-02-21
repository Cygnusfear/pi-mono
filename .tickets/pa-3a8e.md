---
id: pa-3a8e
status: closed
deps: []
links: []
created: 2026-02-17T14:15:20Z
type: feature
priority: 2
assignee: Alexander Mangel
tags: [coding-agent, rlm, feature]
---
# Implement recursive RLM engine and FINAL/FINAL_VAR hybrid protocol

Upgrade coding-agent RLM mode to support recursive rlm() sub-calls with depth/call/iteration budgets, FINAL()/FINAL_VAR() parsing, and resilient REPL context reinjection after .clear.



## Goal
Deliver a functioning recursive RLM runtime with hybrid final-answer protocol and robust REPL behavior.

## Acceptance Criteria
- [ ] RLM exposes rlm(query, context, options) in REPL and pi namespace
- [ ] Recursive calls enforce PI_RLM_MAX_DEPTH/PI_RLM_MAX_CALLS/PI_RLM_MAX_ITERATIONS budgets
- [ ] Model outputs can finalize via FINAL(...) or FINAL_VAR(name), with plain return fallback
- [ ] `.clear` restores custom RLM bindings instead of losing say/think/etc.
- [ ] Unit tests cover FINAL directive parsing

## Verification
- [ ] Run targeted vitest for rlm-mode-final and rlm-mode-config tests
- [ ] Run bun run check

## Worktree
- .
