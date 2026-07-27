# Dr Diet — Product Requirements Document

## 1. Product summary

Dr Diet is a healthy meal subscription app ("Eat What's Right") that lets busy professionals in India get nutritionally-balanced meals delivered on a schedule that fits their life, with minimal planning effort. This PRD merges three inputs into one build spec:

1. **The Raj Mehta user journey map** — real pain points and opportunities at each funnel stage.
2. **Delicut.ae competitive analysis** — a live UAE meal-subscription competitor's UX patterns worth adopting or deliberately avoiding (see `delicut-ae-flow-analysis.md`).
3. **The existing Dr Diet hi-fi HTML prototype** — the flow, screens, and interaction patterns already validated across multiple iteration rounds.

## 2. Primary persona

**Raj Mehta, 25, Corporate Employee / Gym Goer.**
Works 8 hours/day, 5 days/week, gyms 4x/week. Conscious about food for fitness reasons but doesn't want to spend time planning meals.

**Goals:** get fit; get meals that fit his fitness goal and are nutritionally balanced; spend less time planning meals.

**Trust bar is high, patience is low.** He doesn't trust new brands easily and will abandon if a step feels like too much commitment before he's ready.

## 3. Journey-map-driven requirements

Each stage below lists Raj's pain points/thoughts from the journey map and the corresponding product requirement. This is the priority list — build these deliberately, don't treat them as nice-to-haves.

### Discover (mood: Excited → Neutral)
- Pain point: "Raj doesn't trust brands easily"; "difficult to choose among various brands."
- Requirement: Home screen must lead with real, visible trust signals — review count/rating, certifications, a clear one-line value prop ("Eat What's Right"). SEO-style audience landing pages (mirroring Delicut's "for busy professionals / for fitness enthusiasts" pattern) are a v2 growth lever, not required for MVP.

### Explore (mood: Neutral → Confused)
- Pain point: "Comparing meals and nutritional value is difficult"; "difficult to trust nutritional facts"; "slow or lagging website/app."
- Requirement: Explore/Compare screens must show nutrition side-by-side (calories/protein/carbs/fat), not buried in a detail page. Reviews and FAQs must be reachable before any commitment. Performance matters as a stated requirement, not an afterthought — avoid heavy unoptimized client-rendered loading states (Delicut's own `?step=2` screen shows a raw "0%... waiting for you" loading shell — do not repeat this).

### Select & Customize Plan (mood: Confused → Excited)
- Pain points: "Do not know body composition like weight/height"; "do not know what food to choose / what I'm allergic to"; "do not want to commit yet for huge meal quantity or frequency."
- Requirements (these are explicit journey-map **opportunities**, treat as must-build):
  - **Body composition step must be skippable.** Don't hard-gate the flow on height/weight/age entry. Offer a "Skip for now, use a standard calorie target" path.
  - **Calorie goal guidance for users who skip or are unsure** — don't just present raw calorie-tier numbers with no explanation; frame it as a recommendation, editable.
  - **Trial option before committing to a full plan.** Delicut has no such thing (it locks users into Weekly/Monthly/Quarterly with no single-meal trial) — this is a genuine differentiation opportunity. Offer a "Try 3 meals" or single-day trial path alongside the full subscription durations.
  - Allergy selection and dietary preference (Veg/Non-veg/Vegetarian-with-egg etc.) must be explicit, early, and used to filter/flag meal options downstream (already in the existing wizard — keep it, make the flagging visible on meal cards, matching Delicut's per-dish allergen tags).
  - Meal multi-select (Breakfast/Lunch/Evening Snack/Dinner) — already implemented in the current prototype; keep this pattern, it is validated against both Delicut and the journey map ("customize meals... that's cool").

### Checkout (mood: Excited → Neutral)
- Pain points: "When should I start?"; "not sure if I'll like the taste, can I get a trial before I commit?"; "do they deliver to my area?"
- Requirements:
  - Start-date picker, prominent, with a plain-language confirmation of first delivery date (Delicut does this well — copy it: "Your first delivery will be on [date]").
  - **Serviceability (pincode/area) check should happen as early as possible** in Checkout, not discovered as a failure late — surface it right where address is entered, before the user fills in every other field.
  - Reuse the existing Checkout structure: Contact Details separate from Delivery Address; Same/Different address toggle before any address field; delivery-slot chips (adopt Delicut's pattern of recalculating available slots by serviceable area, and communicate to the user *why* options changed if they do).
  - Chip-based delivery instructions (Don't ring bell / Leave at door / Avoid calling / Leave with guard) as primary input, with a free-text fallback for anything not covered (Delicut has no free-text fallback — this is a gap we should close, not repeat).

### Payment (mood: Neutral → Worried → Relieved)
- Pain points: "Worried about payment failure"; "confused if charges are too much"; "will I get a discount?"; "will this deduct every month or just this time?"
- Requirements:
  - Order review screen must itemize price breakdown (Subtotal, taxes/GST if modeled, delivery fee, Total) — always in ₹.
  - **Be explicit about billing cadence in the UI copy itself** — e.g. "You'll be billed ₹X now for this [Weekly/Monthly/Quarterly] plan. [Renews automatically / One-time — no auto-renewal]." This directly answers Raj's stated worry and is a gap in Delicut's own flow (their coupon/cashback mechanic was ambiguous about what the user actually saves).
  - First-time buyer coupon/offer should be visible and applied automatically or with one tap, not require hunting.
  - Payment method picker (Card, UPI, Netbanking, Wallets — UPI should be first/default for the Indian market, unlike Delicut's Apple/Google Pay-first ordering) with a clear success state that ends on "Relieved," matching the journey map's target end-emotion.

## 4. Feature list (build scope)

**Must-have (MVP, matches existing hi-fi prototype + journey-map gaps):**
- Auth: phone OTP, Google, Email — pick one primary + one fallback, don't require all three
- Home / Explore / Plan Compare / Plan Details
- Reviews & FAQs (pre-purchase, reachable without login)
- Guided Plan Builder: Goal → Body Analysis (skippable) → Diet Preference → Allergies → Meal Frequency (multi-select) → Subscription Duration/Size → Meal Preferences → Meal Customization → Summary
- Trial-meal path (new, journey-map-driven differentiator)
- Checkout: Contact Details, Delivery Address (same/different per meal), serviceability check, delivery slot, delivery instructions (chips + free text), start date, coupon
- Order Review → Payment (UPI/Card/Netbanking/Wallet) → Payment Success/Failure states → Subscription Confirmation
- Dashboard: today's meal, upcoming deliveries, skip/pause, change delivery time/address, upgrade plan, contact support, invoices, progress tracking

**Explicitly out of scope for MVP (note for later):**
- AI/photo-based body analysis (journey map lists this as an "opportunity," but it's a distinct ML feature — sequence it after MVP)
- Referral/rewards program mechanics
- Native mobile app (build responsive web first, matching the existing prototype's mobile-first frame; wrap for mobile later if needed)

## 5. Content & compliance constraints

- **Currency: INR (₹) only**, throughout UI, pricing logic, invoices, and all seed/mock data.
- **No beef** in any menu item, protein option, or sample data — diet types should be framed around Veg / Non-Veg (chicken, fish, egg, paneer, etc.) / Vegan, which better matches the Indian market than the original Low-Carb/Balanced/Vegetarian-only framing.
- Certifications/trust badges should reflect whatever is actually true for the real business (FSSAI license is the Indian-market equivalent of Delicut's HACCP/ISO/HALAL badges) — placeholder these clearly if not yet available, don't fabricate certification claims.

## 6. Success criteria for the build

- A user can go from landing on Home to a confirmed, paid subscription without a single dead-end click.
- Every pain point listed in Section 3 has a corresponding, visible product answer in the shipped flow.
- No AED/USD/$ or beef references anywhere in the shipped app.
