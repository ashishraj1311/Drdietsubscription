// Read-only catalog accessors over the static seed data.
import { ALLERGENS, MEALS, PLANS, REVIEWS } from "@/lib/mock/seed";
import type { DietPreference, MealSlot } from "@/lib/types";

export const getPlans = () => PLANS;
export const getPlan = (id: string) => PLANS.find((p) => p.id === id) ?? null;

export const getMeals = () => MEALS;
export const getMeal = (id: string) => MEALS.find((m) => m.id === id) ?? null;
export const getMealsByIds = (ids: string[]) =>
  ids.map((id) => MEALS.find((m) => m.id === id)).filter(Boolean);

export const getMealsFor = (opts: {
  diet?: DietPreference;
  slot?: MealSlot;
}) =>
  MEALS.filter(
    (m) =>
      (!opts.diet || m.diet_types.includes(opts.diet)) &&
      (!opts.slot || m.slot === opts.slot),
  );

export const getAllergens = () => ALLERGENS;
export const getAllergen = (id: string) =>
  ALLERGENS.find((a) => a.id === id) ?? null;

export const getReviews = (planId?: string) =>
  planId ? REVIEWS.filter((r) => r.plan_id === planId || r.plan_id === null) : REVIEWS;

export const avgRating = () =>
  Math.round(
    (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length) * 10,
  ) / 10;
