---
trigger: always_on
---

# Frontend Workflow Execution Map

## Purpose

This document defines how all frontend agents are executed, in what order, and under what rules.  
No feature, layout, animation, or portal logic may bypass this workflow.

This system ensures:

- Scalability
- Modularity
- Performance discipline
- Layer isolation
- UI clarity
- Maintainable codebase

---

# GLOBAL RULES

## 1. Proper Agent Invocation Rule

When invoking an agent, always reference the exact file name.

Correct:
- architecture-agent.md
- design-system-agent.md
- performance-agent.md

Incorrect:
- architecture agent
- perf agent
- role handler

Agent names must match file names exactly.

---

## 2. Layer Isolation Rule

The system has three layers:

Marketing Layer  
Product Layer (Portal)  
Foundation Layer  

Agents must respect layer boundaries.

Marketing Layer:
- narrative-agent.md allowed
- animation-governance-agent.md allowed
- heavy motion allowed (controlled)

Product Layer:
- portal-ux-agent.md required
- narrative-agent.md forbidden
- heavy scroll animation forbidden
- Three.js forbidden

Foundation Layer:
- architecture-agent.md
- state-management-agent.md
- role-permission-agent.md
- code-quality-agent.md

---

## 3. No Direct Implementation Rule

Before writing code, the responsible agent must be identified.

Every feature must declare:
- Affected layer
- Agents required
- Expected validation checklist

No direct coding without agent declaration.

---

# WORKFLOW EXECUTION ORDER

For any new feature or change:

---

## STEP 1 — architecture-agent.md

Always first.

Validate:
- Route placement
- Layout nesting
- Scalability impact
- Layer isolation
- Dependency weight

If architecture fails → stop.

---

## STEP 2 — design-system-agent.md

Validate:
- Component reuse
- Token compliance
- Typography consistency
- Spacing discipline

If new component pattern introduced → must be registered here.

---

## STEP 3 — role-permission-agent.md (If Access Related)

Only if:
- Role-based rendering involved
- New feature visibility rule added
- Protected route created

Validate:
- No hardcoded role checks
- Permission abstraction used
- Scope clearly visible

---

## STEP 4 — state-management-agent.md (If Shared State)

Only if:
- Shared dashboard state
- Auth state logic
- Global filters
- Cross-layout data

Validate:
- No unnecessary re-renders
- Clear separation UI vs server state
- Scoped correctly

---

## STEP 5 — portal-ux-agent.md (For Product Layer)

If working inside portal/dashboard.

Validate:
- Navigation clarity
- Hierarchy visibility
- Cognitive load control
- Mobile compatibility

---

## STEP 6 — narrative-agent.md (Marketing Only)

If working on landing/story.

Validate:
- Animation isolated
- Timeline structured
- No portal contamination

Forbidden in Product Layer.

---

## STEP 7 — animation-governance-agent.md

If any motion is added.

Validate:
- GPU transforms only
- Reduced motion respected
- Cleanup handled
- No GSAP + Framer conflict

---

## STEP 8 — performance-agent.md

Mandatory before merge if:
- New dependency added
- Animation introduced
- Data-heavy view added
- 3D involved
- PWA logic changed

Validate:
- Bundle size impact
- Dynamic imports
- Mobile stability
- LCP & CLS safety

---

## STEP 9 — accessibility-agent.md

Validate:
- Keyboard navigation
- Focus visibility
- ARIA labels
- Contrast compliance
- Motion optionality

Accessibility overrides animation decisions.

---

## STEP 10 — mobile-pwa-agent.md

Validate:
- Touch targets
- Dashboard density
- Bottom navigation clarity
- Offline stability
- Install behavior preserved

Mobile must not be afterthought.

---

## STEP 11 — code-quality-agent.md (Final Gate)

Mandatory before merge.

Validate:
- TypeScript strict mode
- No implicit any
- No duplicated logic
- Naming domain-driven
- File size reasonable
- Lint clean
- No dead code

Cannot be skipped.

---

# CONDITIONAL WORKFLOW MATRIX

Marketing Feature:
1 → architecture-agent.md  
2 → design-system-agent.md  
6 → narrative-agent.md  
7 → animation-governance-agent.md  
8 → performance-agent.md  
9 → accessibility-agent.md  
11 → code-quality-agent.md  

Portal Feature:
1 → architecture-agent.md  
2 → design-system-agent.md  
3 → role-permission-agent.md (if needed)  
4 → state-management-agent.md (if needed)  
5 → portal-ux-agent.md  
7 → animation-governance-agent.md (micro only)  
8 → performance-agent.md  
9 → accessibility-agent.md  
10 → mobile-pwa-agent.md  
11 → code-quality-agent.md  

Foundation Refactor:
1 → architecture-agent.md  
4 → state-management-agent.md  
8 → performance-agent.md  
11 → code-quality-agent.md  

---

# PROHIBITED SHORTCUTS

- No animation without animation-governance-agent.md
- No new dependency without performance-agent.md
- No new role logic without role-permission-agent.md
- No UI pattern without design-system-agent.md
- No merge without code-quality-agent.md

---

# CHANGE IMPACT EVALUATION

Before implementation, answer:

- Does this affect scalability?
- Does this increase bundle size?
- Does this introduce cross-layer dependency?
- Does this increase cognitive load?
- Does this break modularity?

If yes → re-evaluate.

---

# SYSTEM PRINCIPLE

The frontend must behave like:

A modular operating system  
Not a collection of pages  

Structure > Speed  
Clarity > Flash  
Isolation > Coupling  
Scalability > Convenience  

No agent. No change.
