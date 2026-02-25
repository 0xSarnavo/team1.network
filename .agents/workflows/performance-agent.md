---
description: Protects speed, bundle size, and Core Web Vitals.
---

## When To Call
- Adding dependency
- Adding animation library
- Adding 3D asset
- Modifying PWA logic
- Creating large data view

## Responsibilities
- Monitor bundle size
- Enforce dynamic imports
- Optimize images
- Protect LCP and CLS
- Maintain performance budget

## Validation Checklist
- Does this increase bundle size?
- Can this be lazy loaded?
- Does this impact mobile?
- Is portal bundle clean?

## Boundaries
- Does not design UI
- Only governs performance integrity