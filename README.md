# Dr Diet — Eat What's Right

A full, functional healthy-meal-subscription web app for the Indian market
(persona: Raj Mehta — busy gym-goer). Built end-to-end: real routing, real form
state, and a mocked backend for auth, plans, subscriptions and orders.

**Currency is ₹ (INR) only. No beef anywhere.** These are enforced constraints.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** — CSS-first theming via `@theme` in `src/app/globals.css`
  (there is **no** `tailwind.config.ts`).
- Fonts: **Barlow** (primary) + **Baloo 2** (stand-in for the licensed **Quity**
  accent face — swap once licensed).
- Component variants via `class-variance-authority` + `tailwind-merge`.
- **Mocked backend** behind a swappable interface — no external services needed.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint     # eslint
```

## The flow (all built)

Home → Explore / Compare / Plan details / This week's menu / Reviews / FAQs →
**Auth** (Mobile OTP + Google + Guest) → **9-step plan builder** (Goal → Body
[skippable] → Diet → Allergies → Meals → Duration [incl. Trial] → Preferences →
Customisation → Summary) → **Checkout** (serviceability-first address, slot,
instructions, start date, coupon) → **Order review** (itemised ₹ + explicit
billing cadence) → **Payment** (UPI-first, success/failure/retry) →
**Confirmation** → **Dashboard** (today's meals, skip/pause, change time/address,
upgrade, progress, invoices, support, profile w/ account deletion).

`/style-guide` documents the design system.

## Structure

```
src/
  app/
    (site)/            # marketing/discover pages (shared header + footer)
      page.tsx         # Home
      explore, compare, plans/[id], menu, reviews, faqs
    auth/              # OTP + Google + guest
    build/             # 9-step wizard (page.tsx = controller, steps.tsx = steps)
    checkout/          # checkout + review + AddressFields
    payment/           # UPI-first method → processing → success/failure
    confirmation/
    dashboard/         # home, orders, invoices, progress, support, profile, upgrade
    style-guide/
    layout.tsx         # root: fonts + <Providers>
    globals.css        # Tailwind v4 @theme brand tokens
  components/
    ui/                # design-system primitives (Button, Card, Chip, …)
    shared/            # PlanCard, MealCard, bits (RatingStars, MacroBars, …)
    layout/            # SiteHeader, SiteFooter
  lib/
    types.ts           # domain types (mirror docs/05-DATA-MODEL.md)
    format.ts          # inr(), dates, label maps
    pricing.ts         # single source of truth for money math
    diet.ts            # valid proteins per diet, calorie estimates
    mock/
      seed.ts          # plans, meals, reviews, coupons, serviceable pincodes
      api.ts           # DrDietApi interface + mockApi (localStorage-backed)
      catalog.ts       # read-only catalog accessors
    providers/         # AuthProvider + BuilderProvider (+ Providers)
    hooks/             # useDashboardData
```

## Swapping in a real backend

Everything stateful goes through the **`DrDietApi`** interface in
`src/lib/mock/api.ts`. To move to Supabase/Firebase, implement that interface
against the real service and export it as `api` — no UI changes required. The
static catalog (`seed.ts`) would move to DB tables mirroring the same shapes.

## Demo notes

- OTP is mocked — the generated 4-digit code is shown on screen ("Demo mode —
  your code is …").
- Serviceable pincodes start with `400` (Mumbai), `411` (Pune), `560` (Bengaluru).
- Coupons: `WELCOME150` (₹150 off, first order), `FIT10` (10%), `TRYME` (₹100 off trial).
- Payment has a "Simulate a failed payment" toggle to exercise the failure/retry path.
- The **logo symbol is a placeholder** interpretation — replace with the official
  vector from `Brand Guideline Dr Diet.pdf` (see `src/components/ui/Logo.tsx`).
