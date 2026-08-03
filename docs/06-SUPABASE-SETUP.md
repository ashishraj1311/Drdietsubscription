# Supabase Setup — going from mock to a real backend (Phase 1)

This wires the "user buys a subscription" path to a real, shared, durable
backend. With no env vars set, the app keeps running on the localStorage mock
exactly as before — so nothing here can break the existing demo. When the two
public env vars are present, `src/lib/mock/api.ts` automatically swaps the mock
for the Supabase adapter (`src/lib/supabase/api.ts`). No UI code changes.

## What Phase 1 covers

| Capability | Backed by Supabase now? |
|---|---|
| Sign in — phone OTP (real SMS) | ✅ |
| Sign in — Google | ✅ (needs OAuth creds, below) |
| Continue as guest | ✅ (anonymous auth) |
| User profile (goal, diet, body stats) | ✅ `profiles` |
| Create subscription on purchase | ✅ `subscriptions` |
| Generated orders + invoice | ✅ `orders`, `invoices` |
| Dashboard reads (active sub / orders / invoices) | ✅ |
| Pause / resume / skip | ✅ |
| Coupon validation & serviceability | ✅ |
| **Actual payment charge** | ❌ Phase 2 (Razorpay) — payment is still simulated |
| **Admin console data** | ❌ still localStorage — Phase 2 repoints it to Supabase |

Data is protected by Row-Level Security: each user can read/write only their own
rows; the catalog is world-readable.

## Steps

### 1. Create a project
1. Sign up at [supabase.com](https://supabase.com) (free tier is enough).
2. New project → note the **Project URL** and **anon public key**
   (Project Settings → API).

### 2. Apply the schema + seed
In the Supabase dashboard → **SQL Editor**, run, in order:
1. `supabase/migrations/0001_init.sql` — tables, constraints, indexes, RLS,
   and the trigger that auto-creates a `profiles` row per new auth user.
2. `supabase/seed.sql` — the meal/plan/coupon/review catalog (idempotent).

(Or, with the Supabase CLI: `supabase db push` then run the seed.)

### 3. Configure env
```bash
cp .env.example .env.local
```
Fill in:
```
NEXT_PUBLIC_SUPABASE_URL=https://YOURPROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
Restart `npm run dev`. The app is now on Supabase.

### 4. Turn on the auth methods you want
In the dashboard → **Authentication → Providers / Sign In**:
- **Phone (OTP):** enable Phone auth and connect an SMS provider (Twilio,
  MessageBird, Vonage, or a local aggregator). Until an SMS provider is
  connected, real codes won't send. The on-screen "demo code" banner disappears
  automatically once Supabase is active (there's no dev code with real SMS).
- **Anonymous sign-ins:** enable to allow "Continue as guest".
- **Google:** enable the Google provider and paste an OAuth Client ID/secret
  from the Google Cloud console. Add `https://YOURPROJECT.supabase.co/auth/v1/callback`
  as an authorized redirect URI. Sign-in uses a browser redirect back to `/auth`;
  the session is picked up automatically (`detectSessionInUrl`).

### 5. Verify
- Sign in (guest is the quickest), build a plan, and complete checkout.
- In the dashboard → **Table Editor**, confirm rows appeared in
  `subscriptions`, `orders`, and `invoices`, owned by your user id.
- Open the app in a different browser / device and sign in as the same user —
  the subscription is there. That's the real-life behaviour the mock couldn't give.

## How the swap works (for reference)
- `src/lib/supabase/client.ts` — `isSupabaseConfigured()` + a lazy browser client.
- `src/lib/supabase/api.ts` — `supabaseApi`, implementing the `DrDietApi` interface.
- `src/lib/mock/api.ts` — `export const api = isSupabaseConfigured() ? supabaseApi : mockApi;`
- All screens import `{ api }` and call the same async methods either way.

## Not yet wired (next phases)
- **Payments (Phase 2):** Razorpay order + webhook; only mark a subscription
  paid/active on a confirmed webhook. Recurring billing via UPI Autopay/e-mandate.
- **Admin on Supabase (Phase 2):** repoint `src/lib/admin/store.ts` reads to the
  same tables (with an admin role / service access) so every customer shows up
  centrally.
- **Scheduled jobs (Phase 3):** renewals + rolling order generation via Supabase
  cron/Edge Functions instead of the one-shot 7-day batch created at checkout.
- **Notifications (Phase 3):** order/delivery emails + SMS.
