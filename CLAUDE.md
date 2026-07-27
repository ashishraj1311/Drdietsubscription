@AGENTS.md

# CLAUDE.md — Dr Diet App Build Instructions

Claude Code auto-reads this at the start of every session. Standing brief so the
project context doesn't need re-explaining. (Full source spec lives in
`docs/01-CLAUDE.md`; the other `docs/0X-*.md` files are the detailed specs.)

## What we're building

Dr Diet — a healthy meal subscription app for India ("Eat What's Right"). Target
user: Raj Mehta, 25, corporate software engineer, gyms 4x/week, wants
fitness-aligned nutrition without spending time planning meals. Full persona and
journey detail in `docs/02-PRD.md`.

This is a **full end-to-end functional app** (real routing, real form state, a
real-or-realistically-mocked backend for auth/subscriptions/orders) — not a
static clickable prototype.

## Actual stack (as scaffolded — note version drift vs. the docs)

- **Next.js 16** (App Router) + **React 19** + **TypeScript**, `src/` dir, `@/*` alias.
- **Tailwind CSS v4** — CSS-first. There is **NO `tailwind.config.ts`**; the brand
  theme lives in `src/app/globals.css` via `@theme { … }`. The build guide
  (`docs/00-STEP-BY-STEP-GUIDE.md`) says to edit `tailwind.config.ts` — that's
  Tailwind v3-era; ignore it and edit the `@theme` block instead.
- **Backend: mocked first.** Build screens/flows against a local mock data layer
  that mirrors `docs/05-DATA-MODEL.md`; keep it behind an interface so Supabase
  (or Firebase) can be swapped in later without touching UI code.
- Fonts via `next/font/google`: **Barlow** (primary) + **Baloo 2** (stand-in for
  the licensed **Quity** accent face — swap once the Quity license is confirmed).
- Per `AGENTS.md`: this Next.js version has breaking changes vs. older training
  data — check `node_modules/next/dist/docs/` before using unfamiliar APIs.

## Non-negotiable constraints

- **Currency is INR (₹) everywhere.** No AED, USD, or `$` anywhere in UI, copy, or
  data — including seed/mock data.
- **No beef, anywhere.** Not in menu items, protein options, sample data, or copy.
  Treat any beef reference found during a build as a bug.
- **Brand system is fixed.** Colors, fonts, and logo usage come from
  `docs/03-DESIGN-SYSTEM.md` and are wired as Tailwind tokens — use the tokens
  (`bg-primary`, `text-muted`, `bg-accent`, `rounded-lg`, `font-accent`, …), never
  ad-hoc hex codes. Do NOT reintroduce the old prototype's `#1F8A5C` / `#F2A93B`.
- **Reference, don't reinvent, the flow.** `docs/04-USER-FLOWS.md` is the source of
  truth for screens and step order (it already merges the hi-fi prototype,
  Delicut.ae patterns, and the Raj Mehta journey map). Build from it.

## Brand tokens (defined in src/app/globals.css)

| Token | Utility examples | Hex |
|---|---|---|
| `--color-primary` | `bg-primary` `text-primary` | `#434E3D` |
| `--color-primary-light` | `bg-primary-light` | `#F5EDE1` |
| `--color-neutral` | `bg-neutral` `border-neutral` | `#A5AF9B` |
| `--color-accent` | `bg-accent` | `#E2E573` |
| `--color-danger` | `bg-danger` `text-danger` | `#B3462C` |
| `--color-success` | `bg-success` | `#9BA23C` |
| `--color-bg` / `--color-surface` | page canvas / cards | `#F5EDE1` / `#FFFFFF` |
| `--color-muted` | `text-muted` | `#7A8570` |
| `--color-border` | `border-border` | `#DCD6C8` |
| radii | `rounded-sm/md/lg` | `8 / 14 / 20px` |

## Build philosophy

1. Work in vertical slices, not layers: Auth → Discover/Explore → Guided Plan
   Builder → Checkout → Payment → Dashboard. Ship one complete flow at a time.
2. After each slice, run the app and verify the flow manually against
   `docs/04-USER-FLOWS.md` before moving on.
3. Treat the hi-fi HTML prototype as interaction/copy reference, not code to port.
4. Any time you touch pricing, currency, or menu/protein content, grep for
   `AED`, `\$`, `beef` (case-insensitive) before committing — these three
   constraints regress silently.

## Verification checklist (re-run before calling any slice "done")

- [ ] No `AED`, `USD`, or `$` in rendered UI or mock data — only `₹`
- [ ] No occurrence of "beef" (case-insensitive) anywhere in code, copy, or data
- [ ] Every button/CTA navigates somewhere — no dead ends
- [ ] Every screen in `docs/04-USER-FLOWS.md` has a corresponding route/component
- [ ] Loading, empty, error, and success states exist for every async action
- [ ] Colors/fonts match `docs/03-DESIGN-SYSTEM.md` tokens exactly (no ad-hoc hex)
