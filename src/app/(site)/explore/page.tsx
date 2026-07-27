"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button, Chip } from "@/components/ui";
import { PlanCard } from "@/components/shared/PlanCard";
import { getPlans } from "@/lib/mock/catalog";
import { dietLabel, goalLabel } from "@/lib/format";
import type { DietPreference, Goal } from "@/lib/types";

const DIETS: DietPreference[] = ["veg", "non_veg", "vegan", "eggetarian"];
const GOALS: Goal[] = ["lose_weight", "gain_muscle", "maintain", "eat_healthier"];

export default function ExplorePage() {
  const [diet, setDiet] = useState<DietPreference | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);

  const plans = useMemo(
    () =>
      getPlans().filter(
        (p) =>
          (!diet || p.diet_type === diet) && (!goal || p.goal === goal),
      ),
    [diet, goal],
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Explore plans</h1>
          <p className="mt-1 text-sm text-muted">
            Curated meal plans matched to how you eat and train.
          </p>
        </div>
        <Link href="/compare" className="hidden sm:block">
          <Button variant="outline" size="sm">
            Compare nutrition →
          </Button>
        </Link>
      </div>

      <div className="mb-6 space-y-3">
        <FilterRow label="Diet">
          <Chip selected={diet === null} onClick={() => setDiet(null)}>
            All
          </Chip>
          {DIETS.map((d) => (
            <Chip key={d} selected={diet === d} onClick={() => setDiet(d)}>
              {dietLabel(d)}
            </Chip>
          ))}
        </FilterRow>
        <FilterRow label="Goal">
          <Chip selected={goal === null} onClick={() => setGoal(null)}>
            All
          </Chip>
          {GOALS.map((g) => (
            <Chip key={g} selected={goal === g} onClick={() => setGoal(g)}>
              {goalLabel(g)}
            </Chip>
          ))}
        </FilterRow>
      </div>

      {plans.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface p-10 text-center">
          <p className="text-4xl" aria-hidden>
            🍽️
          </p>
          <p className="mt-3 font-semibold">No plans match those filters</p>
          <p className="mt-1 text-sm text-muted">
            Try clearing a filter — or build a fully custom plan instead.
          </p>
          <div className="mt-4">
            <Link href="/build">
              <Button>Build my own plan</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {plans.map((p) => (
            <PlanCard key={p.id} plan={p} />
          ))}
        </div>
      )}
    </main>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-12 text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>
      {children}
    </div>
  );
}
