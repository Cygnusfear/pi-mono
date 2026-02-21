---
id: pa-80ca
status: in_progress
deps: []
links: []
created: 2026-02-17T21:31:03Z
type: bug
priority: 1
assignee: Alexander Mangel
tags: [coding-agent, rlm, bug]
---
# Fix NL->JS translation extracting inline template snippets as code

RLM NL translation currently uses extractCodeBlock() that prefers inline backtick snippets. Model responses containing inline text like `HTTP ${res.status} for ${url}` are interpreted as executable code and crash. Change translation extraction to require fenced code blocks (or full response fallback), avoiding inline snippet extraction.



## Goal
Prevent invalid inline snippets from being executed as generated code in RLM NL mode.

## Acceptance Criteria
- [ ] NL translation no longer extracts inline backtick fragments as executable code
- [ ] Case like `HTTP ${res.status} for ${url}` does not get executed as standalone code
- [ ] Checks pass

## Verification
- [ ] Run bun run check

## Worktree
- .
