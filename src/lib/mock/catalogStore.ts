// Shared catalog store — the SINGLE source of truth for meals, plans and coupons
// used by BOTH the storefront and the admin console. localStorage-backed and
// seeded from ./seed on first use. On the server (SSR) it falls back to the
// static seed, so server-rendered pages show the committed base and client
// pages reflect any admin edits.
import { COUPONS, MEALS, PLANS } from "./seed";
import type { Coupon, Meal, Plan } from "@/lib/types";

const KEY = "drdiet.catalog";

interface CatalogData {
  meals: Meal[];
  plans: Plan[];
  coupons: Coupon[];
}

let cache: CatalogData | null = null;

function seed(): CatalogData {
  return {
    meals: structuredClone(MEALS),
    plans: structuredClone(PLANS),
    coupons: structuredClone(COUPONS),
  };
}

function load(): CatalogData {
  if (typeof window === "undefined") return seed(); // SSR → static base
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as CatalogData) : seed();
  } catch {
    cache = seed();
  }
  if (!localStorage.getItem(KEY)) persist();
  return cache;
}

function persist() {
  if (typeof window === "undefined" || !cache) return;
  localStorage.setItem(KEY, JSON.stringify(cache));
}

function mutate(fn: (d: CatalogData) => void) {
  const d = load();
  if (typeof window === "undefined") return; // never mutate on the server
  fn(d);
  persist();
}

export const catalogStore = {
  // reads
  meals: () => load().meals,
  plans: () => load().plans,
  coupons: () => load().coupons,
  meal: (id: string) => load().meals.find((m) => m.id === id) ?? null,
  plan: (id: string) => load().plans.find((p) => p.id === id) ?? null,
  coupon: (code: string) =>
    load().coupons.find((c) => c.code.toLowerCase() === code.trim().toLowerCase()) ?? null,

  // writes (admin)
  saveMeal: (meal: Meal) =>
    mutate((d) => {
      const i = d.meals.findIndex((m) => m.id === meal.id);
      if (i >= 0) d.meals[i] = meal;
      else d.meals.unshift({ ...meal, id: meal.id || `m-${Date.now().toString(36)}` });
    }),
  removeMeal: (id: string) => mutate((d) => { d.meals = d.meals.filter((m) => m.id !== id); }),
  savePlan: (plan: Plan) =>
    mutate((d) => {
      const i = d.plans.findIndex((p) => p.id === plan.id);
      if (i >= 0) d.plans[i] = plan;
      else d.plans.unshift({ ...plan, id: plan.id || `p-${Date.now().toString(36)}` });
    }),
  removePlan: (id: string) => mutate((d) => { d.plans = d.plans.filter((p) => p.id !== id); }),
  saveCoupon: (coupon: Coupon) =>
    mutate((d) => {
      const i = d.coupons.findIndex((c) => c.code === coupon.code);
      if (i >= 0) d.coupons[i] = coupon;
      else d.coupons.unshift(coupon);
    }),
  removeCoupon: (code: string) => mutate((d) => { d.coupons = d.coupons.filter((c) => c.code !== code); }),

  resetCatalog() {
    cache = seed();
    persist();
  },
};
