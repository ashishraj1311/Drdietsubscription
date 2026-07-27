# Dr Diet — User Flows (Screen-by-Screen Spec)

This is the merged flow: existing hi-fi prototype structure + Delicut.ae competitive patterns worth adopting + Raj Mehta journey-map opportunities. Where a screen changes from the original prototype, the change and its source are called out explicitly. All prices are placeholders in **₹ (INR)** — adjust values, keep the currency and format (`₹1,760` style, comma-separated thousands).

## A. Auth

1. **Splash** → 2. **Welcome** (value prop + trust signals: rating, review count, "Eat What's Right" tagline) → 3. **Login / Signup / Continue as Guest**
   - Auth methods: Mobile OTP (primary, India-first) + Google (fallback). Drop a dedicated Email-password flow — not needed if OTP + Google cover it (simpler than Delicut's 3-way tab, still flexible).
   - **Change from Delicut**: verify *every* identity method independently. If a user later adds a phone number to a Google-authenticated account, that phone still needs its own OTP — do not auto-trust it (this closes a real gap found in Delicut's logged-in flow).
   - Guest browsing allowed through Explore/Compare, gated only at Checkout (see Section D) — matches both the existing prototype and Delicut's pattern of a single late auth gate.

## B. Discover / Explore (pre-purchase, no login required)

4. **Home** — hero value prop, "This week's menu" teaser, plan tiers preview, trust badges (FSSAI, ratings), CTA into Explore or straight into a plan.
5. **Explore** — browsable plan list.
6. **Compare** — side-by-side nutrition (calories/protein/carbs/fat) across plans — must be visible without a click-through, per journey-map "comparing meals and nutrition is difficult" pain point.
7. **Plan Details** — single plan deep-dive: description, sample meals, ingredients, **allergen tags directly on each meal card** (adopted from Delicut's menu page — closes a gap the original prototype had, where allergens only surfaced inside the wizard).
8. **Reviews** — real review list, reachable pre-login.
9. **This Week's Menu** *(new screen, adopted from Delicut)* — filterable by diet type × meal category (Breakfast / Lunch / Dinner / Snacks), each dish shows allergen tag + protein-swap options. Lets an undecided visitor evaluate real food before committing — directly answers the journey map's "is this brand good?" trust hesitation.
10. **FAQs** — reachable from Home/Explore/Plan Details.

## C. Guided Plan Builder (the core wizard — 9 steps, with one new branch)

Step order (`WIZARD_STEPS`): Goal → Body Analysis → Diet Preference → Allergies → Meal Frequency → Subscription Size → Meal Preferences → Meal Customization → Summary.

11. **Goal Selection** — Lose Weight / Gain Muscle / Maintain / Eat Healthier / Custom.
12. **Body Analysis** — height, weight, age, gender.
    - **Change from existing prototype (journey-map opportunity)**: add a visible **"Skip for now"** action. If skipped, the app falls back to a standard calorie target by goal (not blocking). This directly answers Raj's "I haven't checked my weight in a year, does this matter?" hesitation — don't force it.
13. **Diet Preference** — reframe from the original Low-Carb/Balanced/Vegetarian set to an **India-market-appropriate set: Veg / Non-Veg (chicken, fish, egg — no beef, no pork) / Vegan / Eggetarian**. This is a hard content change per the PRD constraints, not optional.
14. **Allergy Selection** — multi-select common allergens + custom "add ingredient you dislike" (Delicut pattern: dislikes are *flagged* on meals, not just excluded outright, giving the user visibility).
15. **Meal Frequency** — multi-select of **Breakfast / Lunch / Evening Snack / Dinner** (unchanged from the current prototype — this pattern is validated and Delicut uses an equivalent multi-select).
16. **Subscription Size / Duration** — offer **Trial (single day / 3 meals), Weekly, Monthly, Quarterly** tiers, each showing:
    - Per-day price and total price in ₹
    - The user's actual selected meal names spelled out ("2 meals/day as Lunch, Dinner") — existing prototype pattern, keep it
    - **New: Trial tier** is the journey-map-driven differentiator vs. Delicut (which has no trial option) — answers "not sure I'll like the taste, can I get a trial before I commit?" directly.
17. **Meal Preferences** — cuisine preferences, protein/side swap options per meal (adopt Delicut's per-dish protein-swap pattern, e.g. "Paneer / Chicken / Soya" swap chips).
18. **Meal Customization** — per-slot (breakfast/lunch/snack/dinner) protein, side, calorie level, portion size.
19. **Subscription Summary** — full recap before moving to checkout; plain-language sentence summarizing meals/day, kcal range, duration, starting price in ₹.

## D. Checkout (auth-gated)

20. **Checkout**, restructured as (in this order — order matters, per prior UX-audit work):
    1. **Contact Details** card (name, mobile, email) — separate from address.
    2. **Delivery Address**:
       - **Serviceability check first**: city/area/pincode selector at the very top of this section, before street address — surfaces "do you deliver to my area?" immediately (journey-map pain point; also closes a real Delicut flaw where this wasn't visible enough).
       - Same/Different-address toggle appears **before** any address field.
       - If "Same": single address field. If "Different": per-meal-slot address fields only (no redundant fallback single field) — this is the already-audited pattern, keep it exactly.
    3. **Delivery Slot** — chip selection; if slot options change based on serviceable area (adopted from Delicut's area-dependent slot granularity), show a short inline note explaining why, so the change doesn't feel arbitrary.
    4. **Delivery Instructions** — preset chips (Don't ring bell / Leave at door / Avoid calling / Leave with guard/security) **plus a free-text fallback field** (closes the gap where Delicut has presets only, no escape hatch).
    5. **Start Date** — date picker with plain-language confirmation: "Your first delivery will be on [date]."
    6. **Coupon** — field + first-time-buyer offer auto-suggested/highlighted, not something the user has to hunt for.
21. **Order Review** — itemized: Subtotal, GST (if modeling tax), Delivery Fee, Total — **all in ₹**, plus an explicit one-line billing-cadence statement (e.g. "Billed ₹X now. [Auto-renews every month / One-time — does not renew]") to directly resolve the journey map's "will this deduct every month or just this time?" worry.

## E. Payment

22. **Payment Method** — **UPI first/default** (India-market equivalent of Delicut's Google Pay default), then Card, Netbanking, Wallets. Keep BNPL only if actually offered by the business (e.g. Indian equivalents like Simpl/LazyPay) — don't fabricate tabby/tamara-style options that don't exist for the market.
23. **Payment Processing** (loading state) → 24. **Payment Success** / 24b. **Payment Failure** (with retry, matching existing prototype's 4-state payment flow) → 25. **Subscription Confirmation** — end on a "Relieved" note per the journey map's target end-emotion: clear confirmation, first delivery date restated, link straight into the Dashboard.

## F. Post-Purchase Dashboard (logged-in, active subscription)

26. **Dashboard** — today's meal, upcoming deliveries.
27. **Skip/Pause meal** action.
28. **Change delivery time** / **Change address** (with the same 12:00-noon/48-hour-style cutoff-window pattern Delicut uses — copy this operational safeguard, it's sound).
29. **Upgrade Plan**.
30. **Progress tracking** (goal progress over time).
31. **Invoices** (all in ₹).
32. **Contact Support**.
33. **Order History / Order Details**.
34. **Profile / Addresses / Notifications** management, including account deletion (self-service, matching Delicut's discoverable "Delete Account" option — good pattern, keep it visible, don't bury it).

**Important gap to close vs. Delicut**: make sure this entire Dashboard section is clearly linked from primary navigation once a user is logged in with an active plan. Delicut's own FAQ *promises* dashboard self-service (pause/skip/change address) but never actually links to it anywhere discoverable in its web nav — don't repeat that mistake.

## Screen-to-requirement traceability

Every screen above should be traceable back to either (a) a screen already in the existing hi-fi prototype, (b) an explicit Delicut pattern worth adopting (noted inline), or (c) a Raj Mehta journey-map pain point/opportunity (noted inline). If you build a screen not covered by one of these three sources, flag it — it's scope creep against this spec.
