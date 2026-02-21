---
id: pa-1ad6
status: closed
deps: []
links: []
created: 2026-02-17T14:10:47Z
type: feature
priority: 2
assignee: Alexander Mangel
tags: [coding-agent, rlm, config]
---
# Add env-configured RLM runtime limits with 3x defaults

Implement PI_RLM_* environment-based limits for RLM mode with increased defaults (3x prior proposal) and add focused tests for parsing/fallback behavior.



## Goal
Allow RLM recursion/runtime limits to be configured from environment variables with robust parsing and sane defaults.

## Acceptance Criteria
- [ ] RLM mode reads PI_RLM_MAX_DEPTH, PI_RLM_MAX_CALLS, PI_RLM_MAX_ITERATIONS, PI_RLM_MAX_CODE_TIME_MS, PI_RLM_MAX_OUTPUT_CHARS from env
- [ ] Defaults are 3x prior proposed values: depth 9, calls 72, iterations 36, timeout 360000ms, output chars 36000
- [ ] Invalid env values fall back to defaults
- [ ] Focused tests verify defaults and overrides

## Verification
- [ ] Run targeted vitest file for new config parser tests
- [ ] Run bun run check in repo root

## Worktree
- .
