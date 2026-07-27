# CLAUDE.md — Dr Diet App Build Instructions

Put this file at the **root of your repo** as `CLAUDE.md`. Claude Code reads it automatically at the start of every session in that project — it's your standing brief so you don't have to re-explain the project every time you open a new terminal.

## What we're building

Dr Diet — a healthy meal subscription app for India. Target user: Raj Mehta, 25, corporate software engineer, gym-goer 4x/week, wants fitness-aligned nutrition without spending time planning meals. Full persona and journey detail in `02-PRD.md`.

This is a **full end-to-end functional app** (not a static prototype): real routing, real form state, a real (or realistically mocked) backend for auth, subscriptions, and orders — not just clickable HTML.

## Non-negotiable constraints

- **Currency is INR (₹) everywhere.** No AED, USD, or $ symbols anywhere in UI, copy, or data — including seed/mock data.
- **No beef, anywhere.** Not in menu items, protein options, sample data, or marketing copy. This is a hard content constraint, not a preference — treat any beef reference found during a build as a bug.
- **Brand system is fixed.** Colors, fonts, and logo usage come from `03-DESIGN-SYSTEM.md` — don't invent a new palette or swap fonts for convenience.
- **Reference, don't reinvent, the flow.** `04-USER-FLOWS.md` is the source of truth for screens and step order. It already merges three inputs (our existing hi-fi HTML prototype, Delicut.ae's competitive UX patterns, and the Raj Mehta journey map's pain points/opportunities) — build from it rather than re-deriving flows from scratch.

## Files in this repo you should always have loaded as context

| File | Purpose | When to read it |
|---|---|---|
| `01-CLAUDE.md` | This file | Always (auto-loaded) |
| `02-PRD.md` | What we're building and why, feature list, journey-map-driven requirements | Before starting any new feature/epic |
| `03-DESIGN-SYSTEM.md` | Colors, type, spacing, component tokens | Before writing any UI component |
| `04-USER-FLOWS.md` | Screen-by-screen flow spec, all 20+ screens | Before building/wiring any screen |
| `05-DATA-MODEL.md` | Entities, fields, relationships | Before writing backend/API/schema code |
| `dr-diet-hifi-prototype.html` | Existing single-file HTML/JS prototype (visual + interaction reference) | When you need to see exact current copy/interaction for a screen before re-implementing it properly |

## Build philosophy

1. Work in vertical slices, not layers. Ship one complete flow at a time (e.g., "Auth" end-to-end, then "Discover → Explore", then "Guided Plan Builder", then "Checkout → Payment", then "Dashboard") rather than "all backend then all frontend."
2. After each slice, run the app and verify the flow manually against `04-USER-FLOWS.md` before moving to the next slice.
3. Treat the HTML prototype as the interaction/copy reference, not as code to port line-by-line — it was vanilla JS for fast iteration; the real app should use whatever stack you choose in Step 1 of the guide (see the companion step-by-step guide document).
4. Any time you touch pricing, currency, or menu/protein content, grep for `AED`, `$`, `beef` before committing — these three constraints are the most likely to regress silently.

## Verification checklist (re-run before calling any slice "done")

- [ ] No `AED`, `USD`, or `$` in rendered UI or seed data — only `₹`
- [ ] No occurrence of "beef" (case-insensitive) anywhere in code, copy, or seed data
- [ ] Every button/CTA navigates somewhere — no dead ends
- [ ] Every screen in `04-USER-FLOWS.md` has a corresponding route/component
- [ ] Loading, empty, error, and success states exist for every async action
- [ ] Colors/fonts match `03-DESIGN-SYSTEM.md` tokens exactly (no ad-hoc hex codes)
