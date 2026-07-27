"use client";

import { useState } from "react";
import { Badge, Card, CardBody, Chip, Input, Select } from "@/components/ui";
import { MacroBars } from "@/components/shared/bits";
import { useBuilder } from "@/lib/providers";
import { cn } from "@/lib/cn";
import {
  dietLabel,
  durationLabel,
  goalLabel,
  inr,
  proteinLabel,
  slotLabel,
} from "@/lib/format";
import { computePrice, DURATION_DAYS, perDayInr } from "@/lib/pricing";
import { estimateFromBody, proteinsForDiet, standardCalories } from "@/lib/diet";
import { ALLERGENS, CUISINE_PREFS } from "@/lib/mock/seed";
import type {
  DietPreference,
  DurationType,
  Gender,
  Goal,
  MealSlot,
  ProteinOption,
} from "@/lib/types";

/* Reusable big selectable option card */
function OptionCard({
  selected,
  onClick,
  emoji,
  title,
  subtitle,
  badge,
}: {
  selected: boolean;
  onClick: () => void;
  emoji: string;
  title: string;
  subtitle?: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "relative flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors",
        selected
          ? "border-primary bg-primary-light ring-2 ring-accent"
          : "border-border bg-surface hover:border-neutral",
      )}
    >
      <span className="text-3xl" aria-hidden>
        {emoji}
      </span>
      <span className="flex-1">
        <span className="block font-bold text-primary">{title}</span>
        {subtitle && <span className="block text-xs text-muted">{subtitle}</span>}
      </span>
      {badge && (
        <Badge variant="accent" size="sm">
          {badge}
        </Badge>
      )}
      {selected && <span className="text-primary">✓</span>}
    </button>
  );
}

/* 1. Goal */
export function GoalStep() {
  const { plan, setPlan } = useBuilder();
  const goals: { g: Goal; emoji: string; sub: string }[] = [
    { g: "lose_weight", emoji: "🔥", sub: "Calorie-smart, high protein" },
    { g: "gain_muscle", emoji: "💪", sub: "Surplus calories, max protein" },
    { g: "maintain", emoji: "⚖️", sub: "Stay balanced and consistent" },
    { g: "eat_healthier", emoji: "🥗", sub: "Cleaner meals, less planning" },
    { g: "custom", emoji: "🛠️", sub: "Build it entirely your way" },
  ];
  return (
    <div className="space-y-3">
      {goals.map((x) => (
        <OptionCard
          key={x.g}
          selected={plan.goal === x.g}
          onClick={() => setPlan({ goal: x.g })}
          emoji={x.emoji}
          title={goalLabel(x.g)}
          subtitle={x.sub}
        />
      ))}
    </div>
  );
}

/* 2. Body analysis (skippable) */
export function BodyStep() {
  const { plan, setPlan } = useBuilder();
  const b = plan.bodyAnalysis;
  const set = (patch: Partial<typeof b>) =>
    setPlan({ bodyAnalysis: { ...b, ...patch, skipped: false } });

  const estimate =
    estimateFromBody({
      height_cm: b.height_cm,
      weight_kg: b.weight_kg,
      age: b.age,
      gender: b.gender,
      goal: plan.goal,
    }) ?? null;

  return (
    <div className="space-y-4">
      <Card tone="canvas">
        <CardBody className="text-sm text-muted">
          Haven&apos;t checked your stats in a while? No problem — you can{" "}
          <strong className="text-primary">skip this</strong> and we&apos;ll use a
          standard target of{" "}
          <strong className="text-primary">
            {standardCalories(plan.goal)} kcal/day
          </strong>{" "}
          for your goal. Editable anytime.
        </CardBody>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Height (cm)"
          inputMode="numeric"
          value={b.height_cm ?? ""}
          onChange={(e) => set({ height_cm: numOrNull(e.target.value) })}
        />
        <Input
          label="Weight (kg)"
          inputMode="numeric"
          value={b.weight_kg ?? ""}
          onChange={(e) => set({ weight_kg: numOrNull(e.target.value) })}
        />
        <Input
          label="Age"
          inputMode="numeric"
          value={b.age ?? ""}
          onChange={(e) => set({ age: numOrNull(e.target.value) })}
        />
        <Select
          label="Gender"
          value={b.gender ?? ""}
          onChange={(e) => set({ gender: (e.target.value || null) as Gender | null })}
        >
          <option value="">Prefer not to say</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </Select>
      </div>

      {estimate && (
        <div className="rounded-md border border-border bg-primary-light p-3 text-sm">
          Based on your stats, we recommend{" "}
          <strong>{estimate} kcal/day</strong> — you can fine-tune this later.
        </div>
      )}
    </div>
  );
}

/* 3. Diet preference */
export function DietStep() {
  const { plan, setPlan } = useBuilder();
  const diets: { d: DietPreference; emoji: string; sub: string }[] = [
    { d: "veg", emoji: "🥦", sub: "Paneer, dal, millets — no egg/meat" },
    { d: "non_veg", emoji: "🍗", sub: "Chicken, fish, egg (no red meat)" },
    { d: "vegan", emoji: "🌱", sub: "100% plant-based, no dairy/egg" },
    { d: "eggetarian", emoji: "🥚", sub: "Vegetarian plus eggs" },
  ];
  return (
    <div className="space-y-3">
      {diets.map((x) => (
        <OptionCard
          key={x.d}
          selected={plan.diet === x.d}
          onClick={() => setPlan({ diet: x.d })}
          emoji={x.emoji}
          title={dietLabel(x.d)}
          subtitle={x.sub}
        />
      ))}
    </div>
  );
}

/* 4. Allergies + dislikes */
export function AllergyStep() {
  const { plan, setPlan } = useBuilder();
  const [dislike, setDislike] = useState("");

  const toggle = (id: string) =>
    setPlan({
      allergenIds: plan.allergenIds.includes(id)
        ? plan.allergenIds.filter((x) => x !== id)
        : [...plan.allergenIds, id],
    });

  const addDislike = () => {
    const v = dislike.trim();
    if (v && !plan.dislikes.includes(v))
      setPlan({ dislikes: [...plan.dislikes, v] });
    setDislike("");
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-semibold">Allergens to avoid</p>
        <div className="flex flex-wrap gap-2">
          {ALLERGENS.map((a) => (
            <Chip
              key={a.id}
              selected={plan.allergenIds.includes(a.id)}
              onClick={() => toggle(a.id)}
            >
              <span aria-hidden>{a.icon}</span> {a.name}
            </Chip>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">
          We&apos;ll flag these on every meal card, not just hide them.
        </p>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Ingredients you dislike</p>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="e.g. mushroom, capsicum"
              value={dislike}
              onChange={(e) => setDislike(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addDislike();
                }
              }}
            />
          </div>
          <button
            type="button"
            onClick={addDislike}
            className="shrink-0 rounded-md border border-primary px-4 text-sm font-semibold text-primary hover:bg-primary/5"
          >
            Add
          </button>
        </div>
        {plan.dislikes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {plan.dislikes.map((d) => (
              <Badge key={d} variant="surface">
                {d}
                <button
                  aria-label={`Remove ${d}`}
                  onClick={() =>
                    setPlan({ dislikes: plan.dislikes.filter((x) => x !== d) })
                  }
                  className="ml-1 text-muted hover:text-danger"
                >
                  ✕
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-muted">
        None to add? You can continue — this step is optional.
      </p>
    </div>
  );
}

/* 5. Meal frequency (multi-select) */
export function FrequencyStep() {
  const { plan, setPlan } = useBuilder();
  const slots: MealSlot[] = ["breakfast", "lunch", "evening_snack", "dinner"];
  const toggle = (s: MealSlot) =>
    setPlan({
      mealSlots: plan.mealSlots.includes(s)
        ? plan.mealSlots.filter((x) => x !== s)
        : [...plan.mealSlots, s],
    });
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        Pick the meals you want delivered. Choose at least one.
      </p>
      {slots.map((s) => (
        <OptionCard
          key={s}
          selected={plan.mealSlots.includes(s)}
          onClick={() => toggle(s)}
          emoji={
            s === "breakfast"
              ? "🌅"
              : s === "lunch"
                ? "☀️"
                : s === "evening_snack"
                  ? "🌆"
                  : "🌙"
          }
          title={slotLabel(s)}
          subtitle={perMealLabel(s)}
        />
      ))}
      <p className="text-xs text-muted">
        {plan.mealSlots.length} meal{plan.mealSlots.length === 1 ? "" : "s"}/day ·{" "}
        {inr(perDayInr(plan.mealSlots.length || 0))}/day before discounts
      </p>
    </div>
  );
}

/* 6. Subscription size / duration */
export function DurationStep() {
  const { plan, setPlan } = useBuilder();
  const mealCount = plan.mealSlots.length || 1;
  const options: { d: DurationType; emoji: string; sub: string; badge?: string }[] = [
    { d: "trial", emoji: "🎁", sub: "3 meals, single day — taste before you commit", badge: "No auto-renew" },
    { d: "weekly", emoji: "📅", sub: "6 delivery days (no Sundays)" },
    { d: "monthly", emoji: "🗓️", sub: "26 delivery days · best value for most", badge: "Save 10%" },
    { d: "quarterly", emoji: "📆", sub: "78 delivery days · maximum savings", badge: "Save 18%" },
  ];

  const selectedNames =
    plan.mealSlots.length > 0
      ? plan.mealSlots.map(slotLabel).join(", ")
      : "your selected meals";

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        Your plan delivers <strong className="text-primary">{selectedNames}</strong>{" "}
        ({mealCount} meal{mealCount === 1 ? "" : "s"}/day).
      </p>
      {options.map((o) => {
        const isTrial = o.d === "trial";
        const count = isTrial ? 3 : mealCount;
        const price = computePrice(o.d, count);
        const days = DURATION_DAYS[o.d];
        return (
          <button
            key={o.d}
            type="button"
            onClick={() => setPlan({ duration: o.d })}
            aria-pressed={plan.duration === o.d}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors",
              plan.duration === o.d
                ? "border-primary bg-primary-light ring-2 ring-accent"
                : "border-border bg-surface hover:border-neutral",
            )}
          >
            <span className="text-3xl" aria-hidden>
              {o.emoji}
            </span>
            <span className="flex-1">
              <span className="flex items-center gap-2 font-bold text-primary">
                {durationLabel(o.d)}
                {o.badge && (
                  <Badge variant="accent" size="sm">
                    {o.badge}
                  </Badge>
                )}
              </span>
              <span className="block text-xs text-muted">{o.sub}</span>
            </span>
            <span className="text-right">
              <span className="block font-bold text-primary">
                {inr(price.totalInr)}
              </span>
              <span className="block text-[11px] text-muted">
                {inr(Math.round(price.totalInr / days))}/day
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* 7. Meal preferences (cuisine) */
export function PreferencesStep() {
  const { plan, setPlan } = useBuilder();
  const toggle = (c: string) =>
    setPlan({
      cuisinePrefs: plan.cuisinePrefs.includes(c)
        ? plan.cuisinePrefs.filter((x) => x !== c)
        : [...plan.cuisinePrefs, c],
    });
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-semibold">Cuisines you enjoy</p>
        <div className="flex flex-wrap gap-2">
          {CUISINE_PREFS.map((c) => (
            <Chip
              key={c}
              selected={plan.cuisinePrefs.includes(c)}
              onClick={() => toggle(c)}
            >
              {c}
            </Chip>
          ))}
        </div>
      </div>
      <Card tone="canvas">
        <CardBody className="text-sm text-muted">
          You&apos;ll be able to swap the protein and side on each meal in the next
          step (e.g. Paneer / Chicken / Soya).
        </CardBody>
      </Card>
      <p className="text-xs text-muted">Optional — pick any, or continue.</p>
    </div>
  );
}

/* 8. Meal customization (per slot) */
export function CustomizationStep() {
  const { plan, setPlan } = useBuilder();
  const proteins = proteinsForDiet(plan.diet);

  const slots = plan.mealSlots.length > 0 ? plan.mealSlots : (["lunch"] as MealSlot[]);

  const getCustom = (slot: MealSlot) =>
    plan.customizations.find((c) => c.slot === slot) ?? {
      slot,
      protein_option: proteins[0],
      calorie_tier: "standard" as const,
      portion: "regular" as const,
    };

  const setCustom = (
    slot: MealSlot,
    patch: Partial<ReturnType<typeof getCustom>>,
  ) => {
    const current = getCustom(slot);
    const next = { ...current, ...patch };
    setPlan({
      customizations: [
        ...plan.customizations.filter((c) => c.slot !== slot),
        next,
      ],
    });
  };

  return (
    <div className="space-y-4">
      {slots.map((slot) => {
        const c = getCustom(slot);
        return (
          <Card key={slot}>
            <CardBody className="space-y-3">
              <p className="font-bold">{slotLabel(slot)}</p>
              <Select
                label="Protein"
                value={c.protein_option}
                onChange={(e) =>
                  setCustom(slot, {
                    protein_option: e.target.value as ProteinOption,
                  })
                }
              >
                {proteins.map((p) => (
                  <option key={p} value={p}>
                    {proteinLabel(p)}
                  </option>
                ))}
              </Select>
              <div>
                <p className="mb-1.5 text-sm font-semibold">Calorie level</p>
                <div className="flex flex-wrap gap-2">
                  {(["light", "standard", "hearty"] as const).map((t) => (
                    <Chip
                      key={t}
                      selected={c.calorie_tier === t}
                      onClick={() => setCustom(slot, { calorie_tier: t })}
                    >
                      {t[0].toUpperCase() + t.slice(1)}
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-sm font-semibold">Portion</p>
                <div className="flex flex-wrap gap-2">
                  {(["regular", "large"] as const).map((p) => (
                    <Chip
                      key={p}
                      selected={c.portion === p}
                      onClick={() => setCustom(slot, { portion: p })}
                    >
                      {p[0].toUpperCase() + p.slice(1)}
                    </Chip>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}

/* 9. Summary */
export function SummaryStep() {
  const { plan } = useBuilder();
  const mealCount = plan.duration === "trial" ? 3 : plan.mealSlots.length || 1;
  const price = computePrice(plan.duration ?? "weekly", mealCount);
  const calories =
    estimateFromBody({
      height_cm: plan.bodyAnalysis.height_cm,
      weight_kg: plan.bodyAnalysis.weight_kg,
      age: plan.bodyAnalysis.age,
      gender: plan.bodyAnalysis.gender,
      goal: plan.goal,
    }) ?? standardCalories(plan.goal);

  const slotsText = plan.mealSlots.map(slotLabel).join(", ") || "meals";

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="space-y-3">
          <p className="text-base text-primary">
            A <strong>{dietLabel(plan.diet ?? "veg")}</strong> plan for{" "}
            <strong>{goalLabel(plan.goal ?? "maintain").toLowerCase()}</strong>,{" "}
            delivering <strong>{plan.mealSlots.length || 1}</strong> meal
            {plan.mealSlots.length === 1 ? "" : "s"}/day ({slotsText}) at around{" "}
            <strong>{calories} kcal/day</strong>, on a{" "}
            <strong>{durationLabel(plan.duration ?? "weekly")}</strong> basis.
          </p>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="accent">{dietLabel(plan.diet ?? "veg")}</Badge>
            <Badge variant="surface">{goalLabel(plan.goal ?? "maintain")}</Badge>
            <Badge variant="neutral">{durationLabel(plan.duration ?? "weekly")}</Badge>
            {plan.allergenIds.length > 0 && (
              <Badge variant="surface">
                {plan.allergenIds.length} allergen
                {plan.allergenIds.length === 1 ? "" : "s"} avoided
              </Badge>
            )}
          </div>
        </CardBody>
      </Card>

      <Card tone="canvas">
        <CardBody className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Meals per day</span>
            <span className="font-semibold">{mealCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Billing days</span>
            <span className="font-semibold">{price.days}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2 text-base">
            <span className="font-semibold">Starting price</span>
            <span className="text-xl font-bold">{inr(price.totalInr)}</span>
          </div>
          <p className="text-xs text-muted">
            Final price, taxes and any coupon are confirmed at checkout.
          </p>
        </CardBody>
      </Card>

      {plan.customizations.length > 0 && (
        <Card>
          <CardBody>
            <p className="mb-2 text-sm font-semibold">Your customisations</p>
            <div className="space-y-1 text-sm text-muted">
              {plan.customizations.map((c) => (
                <div key={c.slot} className="flex justify-between">
                  <span>{slotLabel(c.slot)}</span>
                  <span className="text-primary">
                    {proteinLabel(c.protein_option)} · {c.calorie_tier} · {c.portion}
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {plan.diet && (
        <div className="rounded-md border border-border bg-surface p-3">
          <MacroPreview diet={plan.diet} />
        </div>
      )}
    </div>
  );
}

function MacroPreview({ diet }: { diet: DietPreference }) {
  const split =
    diet === "non_veg"
      ? { protein_pct: 40, carb_pct: 35, fat_pct: 25 }
      : diet === "vegan"
        ? { protein_pct: 28, carb_pct: 47, fat_pct: 25 }
        : { protein_pct: 32, carb_pct: 44, fat_pct: 24 };
  return (
    <>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
        Typical macro split
      </p>
      <MacroBars split={split} />
    </>
  );
}

/* helpers */
function numOrNull(v: string): number | null {
  const n = parseInt(v.replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

function perMealLabel(slot: MealSlot): string {
  switch (slot) {
    case "breakfast":
      return "Start strong — 290–350 kcal";
    case "lunch":
      return "Your biggest meal — 480–560 kcal";
    case "evening_snack":
      return "Light & protein-rich — 180–240 kcal";
    case "dinner":
      return "Balanced wind-down — 430–520 kcal";
  }
}
