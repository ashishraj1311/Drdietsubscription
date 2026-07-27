// Formatting helpers. Currency is ALWAYS Indian Rupees — never another symbol.

/** Format an integer rupee amount as ₹1,760 (Indian comma grouping). */
export function inr(amount: number): string {
  return "₹" + Math.round(amount).toLocaleString("en-IN");
}

/** Format an ISO date as "Mon, 12 Aug". */
export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** Format an ISO date as "12 August 2026". */
export function longDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const SLOT_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  evening_snack: "Evening Snack",
  dinner: "Dinner",
};

export function slotLabel(slot: string): string {
  return SLOT_LABELS[slot] ?? slot;
}

const GOAL_LABELS: Record<string, string> = {
  lose_weight: "Lose Weight",
  gain_muscle: "Gain Muscle",
  maintain: "Maintain",
  eat_healthier: "Eat Healthier",
  custom: "Build Your Own",
};

export function goalLabel(goal: string): string {
  return GOAL_LABELS[goal] ?? goal;
}

const DIET_LABELS: Record<string, string> = {
  veg: "Veg",
  non_veg: "Non-Veg",
  vegan: "Vegan",
  eggetarian: "Eggetarian",
};

export function dietLabel(diet: string): string {
  return DIET_LABELS[diet] ?? diet;
}

const DURATION_LABELS: Record<string, string> = {
  trial: "Trial",
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
};

export function durationLabel(d: string): string {
  return DURATION_LABELS[d] ?? d;
}

const PROTEIN_LABELS: Record<string, string> = {
  paneer: "Paneer",
  chicken: "Chicken",
  fish: "Fish",
  egg: "Egg",
  soya: "Soya",
  tofu: "Tofu",
  lentil: "Lentil",
};

export function proteinLabel(p: string): string {
  return PROTEIN_LABELS[p] ?? p;
}
