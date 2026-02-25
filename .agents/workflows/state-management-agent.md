---
description: Maintains predictable data flow.
---

## When To Call
- Introducing shared state
- Adding global context
- Handling auth state
- Creating cross-dashboard filters

## Responsibilities
- Separate UI vs server state
- Prevent prop drilling
- Avoid unnecessary re-renders
- Scope state correctly

## Validation Checklist
- Is this global or local?
- Can it cause re-renders?
- Is it modular?
- Is it minimal?

## Boundaries
- Does not design UI
- Only governs data flow structure