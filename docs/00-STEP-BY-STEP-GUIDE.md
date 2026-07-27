# How to Build Dr Diet in Claude Code — Step-by-Step

This guide tells you exactly what to do, in order, using the 5 files delivered alongside this one. Read this first.

## The files you have, and what each is for

| File | Goes where | What it's for |
|---|---|---|
| `01-CLAUDE.md` | Repo root, renamed to `CLAUDE.md` | Standing project brief — Claude Code auto-reads this every session |
| `02-PRD.md` | Repo root (or a `/docs` folder) | Product requirements — the *why* behind every screen |
| `03-DESIGN-SYSTEM.md` | Repo root / `/docs` | Colors, fonts, tokens — the *look* |
| `04-USER-FLOWS.md` | Repo root / `/docs` | Screen-by-screen spec — the *what* |
| `05-DATA-MODEL.md` | Repo root / `/docs` | Backend entities — the *data* |
| `dr-diet-hifi-prototype.html` | `/docs/reference/` | Existing interactive prototype — visual/interaction reference only |
| `Brand Guideline Dr Diet.pdf` | `/docs/reference/` | Original brand source (already extracted into `03-DESIGN-SYSTEM.md`, keep for reference) |

You do not need to "upload" these anywhere special — Claude Code reads local files in the project directory. `CLAUDE.md` is the only one it loads automatically; the rest you'll point it to explicitly in your first prompts (see Step 3).

## Step 1 — Pick your stack (5 minutes, decide before you open Claude Code)

You need to decide this yourself first, since it changes how Claude Code scaffolds everything:

- **Frontend**: React (Next.js) is the safest default — huge training data coverage, good for Claude Code to generate correctly, easy deploy to Vercel.
- **Backend**: Options in order of speed-to-working-app:
  1. **Supabase** (Postgres + Auth + Storage, generous free tier, OTP auth built in) — fastest path to a *real* working backend, recommended for a first full build.
  2. Firebase — similar tradeoffs, fine if you prefer it.
  3. Custom Node/Express + Postgres — more control, more work, only if you have a specific reason.
- **Styling**: Tailwind CSS, with the tokens from `03-DESIGN-SYSTEM.md` wired in as Tailwind theme extensions (colors, font families) — keeps the whole app consistent automatically instead of hand-matching hex codes screen by screen.

Recommended for a first pass: **Next.js + Tailwind + Supabase.**

## Step 2 — Set up the project

```
mkdir dr-diet-app && cd dr-diet-app
npx create-next-app@latest . --typescript --tailwind --app
mkdir -p docs/reference
# copy in: CLAUDE.md (root), 02-PRD.md, 03-DESIGN-SYSTEM.md, 04-USER-FLOWS.md, 05-DATA-MODEL.md into docs/
# copy dr-diet-hifi-prototype.html and the brand PDF into docs/reference/
git init && git add -A && git commit -m "init + specs"
```

Then just run `claude` in that directory to start Claude Code.

## Step 3 — Kick off with a grounding prompt

Your very first message in Claude Code (after it auto-loads `CLAUDE.md`) should be something like:

> Read `docs/02-PRD.md`, `docs/03-DESIGN-SYSTEM.md`, and `docs/04-USER-FLOWS.md` in full before doing anything. Then wire up the Tailwind theme in `tailwind.config.ts` using the tokens in the design system doc — colors, font families (Barlow as primary; if the Quity font file isn't available, substitute Baloo 2 from Google Fonts and leave a comment flagging it). Don't build any screens yet — just confirm the theme is wired and show me a tiny test page rendering the palette and type scale so I can sanity-check it before we go further.

This forces Claude Code to actually internalize the docs before generating UI, and gives you a fast checkpoint before 20 screens get built on a wrong color.

## Step 4 — Build in vertical slices (matches `01-CLAUDE.md`'s build philosophy)

Don't ask for "the whole app" in one prompt — it'll be shallow everywhere. Go slice by slice, verifying each before moving on:

1. **Auth slice**: Splash → Welcome → Login (OTP + Google) → Guest browsing gate. Prompt: *"Build the Auth flow per Section A of `04-USER-FLOWS.md`, using Supabase Auth for phone OTP + Google. Wire real routing, not placeholder links."*
2. **Discover/Explore slice**: Home, Explore, Compare, Plan Details, This Week's Menu, Reviews, FAQs (Section B).
3. **Guided Plan Builder slice**: all 9 wizard steps + the new Trial tier and skippable Body Analysis (Section C). This is the biggest slice — consider splitting it into two prompts (steps 1–5, then 6–9) if Claude Code's output starts feeling shallow.
4. **Checkout slice**: Contact/Address/Slot/Instructions/Start Date/Coupon, in the exact order specified in Section D — order matters, it's UX-audited.
5. **Payment slice**: Payment Method (UPI-first) → Processing → Success/Failure → Confirmation (Section E).
6. **Dashboard slice**: today's meal, skip/pause, change address/time, upgrade, progress, invoices, support (Section F) — and make sure it's actually linked from nav once a user has an active subscription (this was a real gap found in the competitor analysis; don't repeat it).

After each slice, **run the app and click through it yourself** against the relevant section of `04-USER-FLOWS.md` before telling Claude Code to move to the next slice.

## Step 5 — Backend/data slice (can run in parallel with slice 3 onward)

Prompt Claude Code to scaffold Supabase tables from `05-DATA-MODEL.md` directly:

> Create Supabase migration SQL for the entities in `docs/05-DATA-MODEL.md`. All money fields must be `_inr` and stored as integers (paise) or numeric — no other currency. Add a check constraint or seed-data test that rejects `beef` in any `protein_option` or ingredient field.

## Step 6 — Verification pass (do this before considering anything "done")

Run through the checklist in `01-CLAUDE.md` yourself, plus:
- Search the whole repo for `AED`, `$`, and `beef` (case-insensitive) — should return zero matches outside this guide/docs.
- Click every button in every screen once — confirm nothing dead-ends.
- Check color/font rendering against `03-DESIGN-SYSTEM.md` on at least 3 screens.

If you want, once a slice is built I can review the actual code/screens for you the same way I reviewed the Delicut flows — just share the repo or screenshots and I'll audit it against these specs.

## Quick reference: what changed vs. the original HTML prototype

- Currency: all pricing converted to ₹ (INR), no AED/$ anywhere.
- Diet types: Low-Carb/Balanced/Vegetarian → Veg / Non-Veg / Vegan / Eggetarian (India-market fit), with a hard no-beef constraint on all protein options.
- New: skippable Body Analysis step, Trial subscription tier, serviceability check moved earlier in Checkout, free-text fallback added to delivery instructions, explicit billing-cadence copy on Order Review, UPI-first payment method ordering, and full re-skin to the official brand palette (`#434E3D` / `#F5EDE1` / `#A5AF9B` / `#E2E573`) and Barlow/Quity typography.
