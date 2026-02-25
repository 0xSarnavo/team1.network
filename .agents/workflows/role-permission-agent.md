---
description: Manages permission-based UI rendering.
---

## When To Call
- Adding role
- Modifying access control
- Creating protected route
- Introducing feature flags

## Responsibilities
- Centralize permission logic
- Prevent hardcoded role checks
- Manage feature flags
- Ensure role-based layout clarity

## Validation Checklist
- Is permission abstraction used?
- Is role logic centralized?
- Does UI flicker?
- Is scope visible?

## Boundaries
- Does not manage backend auth
- Only controls UI visibility