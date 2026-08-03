// Read-only catalog accessors. Meals/plans/coupons come from the SHARED
// catalogStore (so admin edits reflect on the storefront); allergens/reviews
// remain static seed (not admin-editable).
import { ALLERGENS, REVIEWS } from "@/lib/mock/seed";
import { catalogStore } from "@/lib/mock/catalogStore";
import type { DietPreference, MealSlot } from "@/lib/types";

export const getPlans = () => catalogStore.plans();
export const getPlan = (id: string) => catalogStore.plan(id);

export const getMeals = () => catalogStore.meals();
export const getMeal = (id: string) => catalogStore.meal(id);
export const getMealsByIds = (ids: string[]) =>
  ids.map((id) => catalogStore.meal(id)).filter(Boolean);

export const getMealsFor = (opts: {
  diet?: DietPreference;
  slot?: MealSlot;
}) =>
  catalogStore.meals().filter(
    (m) =>
      (!opts.diet || m.diet_types.includes(opts.diet)) &&
      (!opts.slot || m.slot === opts.slot),
  );

export const getCoupons = () => catalogStore.coupons();
export const getCoupon = (code: string) => catalogStore.coupon(code);

export const getAllergens = () => ALLERGENS;
export const getAllergen = (id: string) =>
  ALLERGENS.find((a) => a.id === id) ?? null;

export const getReviews = (planId?: string) =>
  planId ? REVIEWS.filter((r) => r.plan_id === planId || r.plan_id === null) : REVIEWS;

export const avgRating = () =>
  Math.round(
    (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length) * 10,
  ) / 10;
