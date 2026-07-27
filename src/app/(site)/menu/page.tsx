"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { Button, Chip } from "@/components/ui";
import { MealCard } from "@/components/shared/MealCard";
import { getMeals } from "@/lib/mock/catalog";
import { dietLabel, slotLabel } from "@/lib/format";
import type { DietPreference, MealSlot } from "@/lib/types";

const DIETS: DietPreference[] = ["veg", "non_veg", "vegan", "eggetarian"];
const SLOTS: MealSlot[] = ["breakfast", "lunch", "evening_snack", "dinner"];

export default function MenuPage() {
  const [diet, setDiet] = useState<DietPreference | null>(null);
  const [slot, setSlot] = useState<MealSlot | null>(null);

  const meals = useMemo(
    () =>
      getMeals().filter(
        (m) =>
          (!diet || m.diet_types.includes(diet)) &&
          (!slot || m.slot === slot),
      ),
    [diet, slot],
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold">This week&apos;s menu</h1>
      <p className="mt-1 text-sm text-muted">
        Real dishes with real macros and allergen tags — evaluate the food before
        you commit.
      </p>

      <div className="mt-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-16 text-xs font-semibold uppercase tracking-wide text-muted">
            Diet
          </span>
          <Chip selected={diet === null} onClick={() => setDiet(null)}>
            All
          </Chip>
          {DIETS.map((d) => (
            <Chip key={d} selected={diet === d} onClick={() => setDiet(d)}>
              {dietLabel(d)}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-16 text-xs font-semibold uppercase tracking-wide text-muted">
            Meal
          </span>
          <Chip selected={slot === null} onClick={() => setSlot(null)}>
            All
          </Chip>
          {SLOTS.map((s) => (
            <Chip key={s} selected={slot === s} onClick={() => setSlot(s)}>
              {slotLabel(s)}
            </Chip>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-muted">
        {meals.length} {meals.length === 1 ? "dish" : "dishes"}
      </p>

      {meals.length === 0 ? (
        <div className="mt-4 rounded-lg border border-border bg-surface p-10 text-center">
          <UtensilsCrossed size={40} className="mx-auto text-neutral" aria-hidden />
          <p className="mt-3 font-semibold">Nothing on the menu for that combo</p>
          <p className="mt-1 text-sm text-muted">Try a different diet or meal filter.</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {meals.map((m) => (
            <MealCard key={m.id} meal={m} />
          ))}
        </div>
      )}

      <div className="mt-10 rounded-lg bg-primary p-6 text-center">
        <p className="text-lg font-bold text-primary-light">Like what you see?</p>
        <div className="mt-3 flex justify-center">
          <Link href="/build">
            <Button variant="accent" size="lg">
              Build my plan
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
