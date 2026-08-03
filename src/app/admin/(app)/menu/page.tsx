"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  BottomSheet,
  Button,
  Card,
  Chip,
  Input,
  PageLoader,
  Select,
} from "@/components/ui";
import { PageHeader } from "@/components/admin/bits";
import { Badge } from "@/components/ui";
import { useAdmin } from "@/lib/admin/useAdmin";
import { adminStore } from "@/lib/admin/store";
import { dietLabel, inr, proteinLabel, slotLabel } from "@/lib/format";
import type {
  DietPreference,
  Goal,
  Meal,
  MealSlot,
  Plan,
  ProteinOption,
} from "@/lib/types";

const SLOTS: MealSlot[] = ["breakfast", "lunch", "evening_snack", "dinner"];
const DIETS: DietPreference[] = ["veg", "non_veg", "vegan", "eggetarian"];
const PROTEINS: ProteinOption[] = ["paneer", "chicken", "fish", "egg", "soya", "tofu", "lentil"];
const GOALS: Goal[] = ["lose_weight", "gain_muscle", "maintain", "eat_healthier"];

const blankMeal = (): Meal => ({
  id: "", name: "", slot: "lunch", calories: 400, protein_g: 30, carbs_g: 40, fat_g: 15,
  protein_option: "paneer", allergen_ids: [], diet_types: ["veg"], emoji: "🍽️", description: "",
});
const blankPlan = (): Plan => ({
  id: "", name: "", tagline: "", diet_type: "veg", goal: "maintain", description: "",
  macro_split: { protein_pct: 30, carb_pct: 45, fat_pct: 25 }, calories_per_day: 1800,
  price_per_day_inr: 300, sample_meal_ids: [], rating: 4.5, review_count: 0, emoji: "🥗", highlights: [],
});

export default function MenuAdminPage() {
  const { hydrated, tick, refresh } = useAdmin();
  const [tab, setTab] = useState<"meals" | "plans">("meals");
  const [meal, setMeal] = useState<Meal | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- tick re-reads the store after mutations
  const meals = useMemo(() => (hydrated ? adminStore.meals() : []), [hydrated, tick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- tick re-reads the store after mutations
  const plans = useMemo(() => (hydrated ? adminStore.plans() : []), [hydrated, tick]);

  if (!hydrated) return <PageLoader />;

  return (
    <>
      <PageHeader title="Menu & Plans" subtitle="Manage dishes and curated plans.">
        {tab === "meals" ? (
          <Button size="sm" onClick={() => setMeal(blankMeal())}><Plus size={16} /> Add meal</Button>
        ) : (
          <Button size="sm" onClick={() => setPlan(blankPlan())}><Plus size={16} /> Add plan</Button>
        )}
      </PageHeader>

      <div className="mb-4 flex gap-2">
        <Chip selected={tab === "meals"} onClick={() => setTab("meals")}>Meals ({meals.length})</Chip>
        <Chip selected={tab === "plans"} onClick={() => setTab("plans")}>Plans ({plans.length})</Chip>
      </div>

      {tab === "meals" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {meals.map((m) => (
            <Card key={m.id}>
              <div className="flex items-start justify-between gap-2 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl" aria-hidden>{m.emoji}</span>
                    <p className="truncate font-bold">{m.name}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted">{slotLabel(m.slot)} · {m.calories} kcal · {m.protein_g}g protein</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge variant="neutral" size="sm">{proteinLabel(m.protein_option)}</Badge>
                    {m.diet_types.map((d) => <Badge key={d} variant="surface" size="sm">{dietLabel(d)}</Badge>)}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <button aria-label="Edit" className="text-muted hover:text-primary" onClick={() => setMeal({ ...m })}><Pencil size={16} /></button>
                  <button aria-label="Delete" className="text-muted hover:text-danger" onClick={() => { if (confirm(`Delete ${m.name}?`)) { adminStore.removeMeal(m.id); refresh(); } }}><Trash2 size={16} /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((p) => (
            <Card key={p.id}>
              <div className="flex items-start justify-between gap-2 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl" aria-hidden>{p.emoji}</span>
                    <p className="truncate font-bold">{p.name}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted">{p.tagline}</p>
                  <p className="mt-2 text-sm font-semibold">{inr(p.price_per_day_inr)}<span className="text-xs font-normal text-muted">/day · {p.calories_per_day} kcal</span></p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge variant="accent" size="sm">{dietLabel(p.diet_type)}</Badge>
                    <Badge variant="surface" size="sm">★ {p.rating}</Badge>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <button aria-label="Edit" className="text-muted hover:text-primary" onClick={() => setPlan({ ...p })}><Pencil size={16} /></button>
                  <button aria-label="Delete" className="text-muted hover:text-danger" onClick={() => { if (confirm(`Delete ${p.name}?`)) { adminStore.removePlan(p.id); refresh(); } }}><Trash2 size={16} /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Meal form */}
      <BottomSheet open={!!meal} onClose={() => setMeal(null)} title={meal?.id ? "Edit meal" : "New meal"}>
        {meal && (
          <div className="space-y-3">
            <Input label="Name" value={meal.name} onChange={(e) => setMeal({ ...meal, name: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Slot" value={meal.slot} onChange={(e) => setMeal({ ...meal, slot: e.target.value as MealSlot })}>
                {SLOTS.map((s) => <option key={s} value={s}>{slotLabel(s)}</option>)}
              </Select>
              <Select label="Protein" value={meal.protein_option} onChange={(e) => setMeal({ ...meal, protein_option: e.target.value as ProteinOption })}>
                {PROTEINS.map((p) => <option key={p} value={p}>{proteinLabel(p)}</option>)}
              </Select>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <Input label="kcal" inputMode="numeric" value={meal.calories} onChange={(e) => setMeal({ ...meal, calories: +e.target.value || 0 })} />
              <Input label="Protein g" inputMode="numeric" value={meal.protein_g} onChange={(e) => setMeal({ ...meal, protein_g: +e.target.value || 0 })} />
              <Input label="Carbs g" inputMode="numeric" value={meal.carbs_g} onChange={(e) => setMeal({ ...meal, carbs_g: +e.target.value || 0 })} />
              <Input label="Fat g" inputMode="numeric" value={meal.fat_g} onChange={(e) => setMeal({ ...meal, fat_g: +e.target.value || 0 })} />
            </div>
            <div>
              <p className="mb-1.5 text-sm font-semibold">Diet types</p>
              <div className="flex flex-wrap gap-2">
                {DIETS.map((d) => (
                  <Chip key={d} selected={meal.diet_types.includes(d)} onClick={() => setMeal({ ...meal, diet_types: meal.diet_types.includes(d) ? meal.diet_types.filter((x) => x !== d) : [...meal.diet_types, d] })}>{dietLabel(d)}</Chip>
                ))}
              </div>
            </div>
            <Input label="Emoji" value={meal.emoji} onChange={(e) => setMeal({ ...meal, emoji: e.target.value })} />
            <Input label="Description" value={meal.description} onChange={(e) => setMeal({ ...meal, description: e.target.value })} />
            <Button fullWidth disabled={!meal.name.trim() || meal.diet_types.length === 0} onClick={() => { adminStore.saveMeal(meal); setMeal(null); refresh(); }}>
              Save meal
            </Button>
          </div>
        )}
      </BottomSheet>

      {/* Plan form */}
      <BottomSheet open={!!plan} onClose={() => setPlan(null)} title={plan?.id ? "Edit plan" : "New plan"}>
        {plan && (
          <div className="space-y-3">
            <Input label="Name" value={plan.name} onChange={(e) => setPlan({ ...plan, name: e.target.value })} />
            <Input label="Tagline" value={plan.tagline} onChange={(e) => setPlan({ ...plan, tagline: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Diet" value={plan.diet_type} onChange={(e) => setPlan({ ...plan, diet_type: e.target.value as DietPreference })}>
                {DIETS.map((d) => <option key={d} value={d}>{dietLabel(d)}</option>)}
              </Select>
              <Select label="Goal" value={plan.goal} onChange={(e) => setPlan({ ...plan, goal: e.target.value as Goal })}>
                {GOALS.map((g) => <option key={g} value={g}>{g.replace("_", " ")}</option>)}
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input label="kcal/day" inputMode="numeric" value={plan.calories_per_day} onChange={(e) => setPlan({ ...plan, calories_per_day: +e.target.value || 0 })} />
              <Input label="₹/day" inputMode="numeric" value={plan.price_per_day_inr} onChange={(e) => setPlan({ ...plan, price_per_day_inr: +e.target.value || 0 })} />
              <Input label="Rating" inputMode="decimal" value={plan.rating} onChange={(e) => setPlan({ ...plan, rating: +e.target.value || 0 })} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input label="Protein %" inputMode="numeric" value={plan.macro_split.protein_pct} onChange={(e) => setPlan({ ...plan, macro_split: { ...plan.macro_split, protein_pct: +e.target.value || 0 } })} />
              <Input label="Carb %" inputMode="numeric" value={plan.macro_split.carb_pct} onChange={(e) => setPlan({ ...plan, macro_split: { ...plan.macro_split, carb_pct: +e.target.value || 0 } })} />
              <Input label="Fat %" inputMode="numeric" value={plan.macro_split.fat_pct} onChange={(e) => setPlan({ ...plan, macro_split: { ...plan.macro_split, fat_pct: +e.target.value || 0 } })} />
            </div>
            <Input label="Emoji" value={plan.emoji} onChange={(e) => setPlan({ ...plan, emoji: e.target.value })} />
            <Input label="Highlights (comma-separated)" value={plan.highlights.join(", ")} onChange={(e) => setPlan({ ...plan, highlights: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
            <Input label="Description" value={plan.description} onChange={(e) => setPlan({ ...plan, description: e.target.value })} />
            <Button fullWidth disabled={!plan.name.trim()} onClick={() => { adminStore.savePlan(plan); setPlan(null); refresh(); }}>
              Save plan
            </Button>
          </div>
        )}
      </BottomSheet>
    </>
  );
}
