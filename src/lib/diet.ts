import type { DietPreference, ProteinOption } from "@/lib/types";

// Valid protein options per diet. NEVER includes beef (not a ProteinOption at all).
const PROTEINS_BY_DIET: Record<DietPreference, ProteinOption[]> = {
  veg: ["paneer", "soya", "tofu", "lentil"],
  non_veg: ["chicken", "fish", "egg", "paneer", "lentil"],
  vegan: ["soya", "tofu", "lentil"],
  eggetarian: ["egg", "paneer", "soya", "tofu", "lentil"],
};

export function proteinsForDiet(diet: DietPreference | null): ProteinOption[] {
  if (!diet) return ["paneer", "lentil"];
  return PROTEINS_BY_DIET[diet];
}

// Standard calorie target by goal when body analysis is skipped/unknown.
export function standardCalories(goal: string | null): number {
  switch (goal) {
    case "lose_weight":
      return 1500;
    case "gain_muscle":
      return 2400;
    case "eat_healthier":
      return 1700;
    case "maintain":
      return 1900;
    default:
      return 1900;
  }
}

// A very rough Mifflin-St Jeor-ish estimate for the "we did the math" moment.
export function estimateFromBody(opts: {
  height_cm: number | null;
  weight_kg: number | null;
  age: number | null;
  gender: string | null;
  goal: string | null;
}): number | null {
  const { height_cm, weight_kg, age, gender, goal } = opts;
  if (!height_cm || !weight_kg || !age) return null;
  const s = gender === "female" ? -161 : 5;
  const bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + s;
  const maintenance = Math.round((bmr * 1.5) / 10) * 10; // active-ish
  if (goal === "lose_weight") return maintenance - 400;
  if (goal === "gain_muscle") return maintenance + 350;
  return maintenance;
}
