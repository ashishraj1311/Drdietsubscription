"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  CheckoutState,
  PlanBuilderState,
} from "@/lib/types";

const PLAN_KEY = "drdiet.builder.plan";
const CHECKOUT_KEY = "drdiet.builder.checkout";

const emptyPlan: PlanBuilderState = {
  goal: null,
  bodyAnalysis: {
    skipped: false,
    height_cm: null,
    weight_kg: null,
    age: null,
    gender: null,
  },
  diet: null,
  allergenIds: [],
  dislikes: [],
  mealSlots: [],
  duration: null,
  cuisinePrefs: [],
  customizations: [],
  planId: null,
};

function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

const emptyCheckout: CheckoutState = {
  contact: { name: "", phone: "", email: "" },
  addressMode: "same",
  address: null,
  perSlotAddresses: {},
  delivery: {
    slot: "",
    instructionPresets: [],
    instructionFreetext: "",
    startDate: tomorrowISO(),
  },
  couponCode: null,
};

interface BuilderContextValue {
  plan: PlanBuilderState;
  checkout: CheckoutState;
  setPlan: (patch: Partial<PlanBuilderState>) => void;
  setCheckout: (patch: Partial<CheckoutState>) => void;
  resetPlan: () => void;
  resetAll: () => void;
  hydrated: boolean;
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...(JSON.parse(raw) as object) } : fallback;
  } catch {
    return fallback;
  }
}

export function BuilderProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlanState] = useState<PlanBuilderState>(emptyPlan);
  const [checkout, setCheckoutState] = useState<CheckoutState>(emptyCheckout);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hydrate working state from localStorage (client-only) on mount.
    /* eslint-disable react-hooks/set-state-in-effect */
    setPlanState(load(PLAN_KEY, emptyPlan));
    setCheckoutState(load(CHECKOUT_KEY, emptyCheckout));
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const setPlan = useCallback((patch: Partial<PlanBuilderState>) => {
    setPlanState((prev) => {
      const next = { ...prev, ...patch };
      if (typeof window !== "undefined")
        localStorage.setItem(PLAN_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setCheckout = useCallback((patch: Partial<CheckoutState>) => {
    setCheckoutState((prev) => {
      const next = { ...prev, ...patch };
      if (typeof window !== "undefined")
        localStorage.setItem(CHECKOUT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetPlan = useCallback(() => {
    setPlanState(emptyPlan);
    if (typeof window !== "undefined") localStorage.removeItem(PLAN_KEY);
  }, []);

  const resetAll = useCallback(() => {
    setPlanState(emptyPlan);
    setCheckoutState({ ...emptyCheckout, delivery: { ...emptyCheckout.delivery, startDate: tomorrowISO() } });
    if (typeof window !== "undefined") {
      localStorage.removeItem(PLAN_KEY);
      localStorage.removeItem(CHECKOUT_KEY);
    }
  }, []);

  const value = useMemo<BuilderContextValue>(
    () => ({
      plan,
      checkout,
      setPlan,
      setCheckout,
      resetPlan,
      resetAll,
      hydrated,
    }),
    [plan, checkout, setPlan, setCheckout, resetPlan, resetAll, hydrated],
  );

  return (
    <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>
  );
}

export function useBuilder() {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error("useBuilder must be used within BuilderProvider");
  return ctx;
}
