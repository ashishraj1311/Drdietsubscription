# Dr Diet — Data Model

Entity sketch for backend/schema design. Field lists are a starting point — expand as needed during build, but keep the currency and content constraints intact (`price_inr`, no `beef` in any `protein`/`ingredient` enum).

## User
- id, name, email (nullable), phone (nullable), auth_provider (otp | google), phone_verified (bool), email_verified (bool)
- created_at, goal (enum), diet_preference (enum: veg | non_veg | vegan | eggetarian)
- height_cm, weight_kg, age, gender (all nullable — body analysis is skippable per PRD)
- allergies: [Allergen]
- disliked_ingredients: [string]

## Allergen (reference table)
- id, name, icon

## Plan
- id, name, diet_type, description, macro_split {protein_pct, carb_pct, fat_pct}, sample_meals: [Meal], rating, review_count

## Meal
- id, name, slot (enum: breakfast | lunch | evening_snack | dinner), calories, protein_g, carbs_g, fat_g
- protein_option (enum: paneer | chicken | fish | egg | soya | tofu | lentil — **never** `beef`)
- allergen_tags: [Allergen]
- image_url

## Subscription
- id, user_id, plan_id
- meal_slots_selected: [breakfast|lunch|evening_snack|dinner] (multi-select, min 1)
- duration_type (enum: trial | weekly | monthly | quarterly)
- calorie_tier, start_date, status (active | paused | cancelled)
- price_per_day_inr, total_price_inr

## Address
- id, user_id, label (home | work | other), line1, area, city, pincode
- serviceable (bool, derived from pincode lookup)
- linked_meal_slot (nullable — set when delivery-address mode is "different per meal")

## DeliveryPreference
- subscription_id, meal_slot, address_id, delivery_slot (time window enum), instructions_preset: [chip enum], instructions_freetext (nullable)

## Order
- id, subscription_id, delivery_date, meal_slot, status (upcoming | delivered | skipped | paused)

## Coupon
- code, discount_type (flat_inr | percent | cashback_inr), value, is_first_time_buyer_only (bool)

## Payment
- id, order/subscription_id, method (upi | card | netbanking | wallet), amount_inr, status (pending | success | failed), billing_cadence (one_time | auto_renew)

## Invoice
- id, user_id, subscription_id, amount_inr, gst_inr, date, pdf_url

## Review
- id, plan_id, user_name, rating, comment, created_at

## Notes for implementation
- All monetary fields are `_inr` suffixed integers/decimals in rupees (or paise if you want sub-unit precision) — never store or render another currency.
- `protein_option` and any seeded `Meal`/ingredient data must be validated against a denylist containing `beef` (and `beef`-derived terms) as part of your seed-data tests.
- `serviceable` on `Address` should be checked as early as the pincode/area is entered in Checkout, not deferred to order placement — this is what powers the "check serviceability early" requirement in `04-USER-FLOWS.md`.
