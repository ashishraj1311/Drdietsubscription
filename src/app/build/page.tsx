"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Logo, PageLoader, SegmentedProgress } from "@/components/ui";
import { useBuilder } from "@/lib/providers";
import { getPlan } from "@/lib/mock/catalog";
import type { PlanBuilderState } from "@/lib/types";
import {
  AllergyStep,
  BodyStep,
  CustomizationStep,
  DietStep,
  DurationStep,
  FrequencyStep,
  GoalStep,
  PreferencesStep,
  SummaryStep,
} from "./steps";
import { BuildIntro } from "./BuildIntro";

type Step = {
  key: string;
  title: string;
  subtitle: string;
  Component: () => React.ReactNode;
  canNext: (p: PlanBuilderState) => boolean;
  optional?: boolean;
};

const STEPS: Step[] = [
  { key: "goal", title: "What's your goal?", subtitle: "We'll tune everything around this.", Component: GoalStep, canNext: (p) => p.goal !== null },
  { key: "body", title: "Body analysis", subtitle: "Optional — skip to use a standard target.", Component: BodyStep, canNext: () => true, optional: true },
  { key: "diet", title: "Diet preference", subtitle: "This filters every meal we suggest.", Component: DietStep, canNext: (p) => p.diet !== null },
  { key: "allergies", title: "Allergies & dislikes", subtitle: "We'll flag and avoid these.", Component: AllergyStep, canNext: () => true, optional: true },
  { key: "frequency", title: "Which meals?", subtitle: "Choose at least one meal per day.", Component: FrequencyStep, canNext: (p) => p.mealSlots.length >= 1 },
  { key: "duration", title: "Pick your plan size", subtitle: "Start with a trial or commit for more savings.", Component: DurationStep, canNext: (p) => p.duration !== null },
  { key: "preferences", title: "Meal preferences", subtitle: "Optional — help us pick cuisines.", Component: PreferencesStep, canNext: () => true, optional: true },
  { key: "customization", title: "Customise each meal", subtitle: "Protein, calories and portion per slot.", Component: CustomizationStep, canNext: () => true },
  { key: "summary", title: "Your plan", subtitle: "Review before checkout.", Component: SummaryStep, canNext: () => true },
];

export default function BuildPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Wizard />
    </Suspense>
  );
}

function Wizard() {
  const router = useRouter();
  const params = useSearchParams();
  const { plan, setPlan, hydrated } = useBuilder();
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const prefilled = useRef(false);

  // Prefill goal/diet from a curated plan when arriving via /build?plan=<id>.
  // Arriving with a chosen plan skips the intro and lands straight in the wizard.
  useEffect(() => {
    if (!hydrated || prefilled.current) return;
    prefilled.current = true;
    const planId = params.get("plan");
    if (planId) {
      const curated = getPlan(planId);
      if (curated) {
        setPlan({
          planId: curated.id,
          goal: curated.goal,
          diet: curated.diet_type,
        });
        setStarted(true);
      }
    }
  }, [hydrated, params, setPlan]);

  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;
  const canNext = step.canNext(plan);

  function next() {
    if (isLast) {
      router.push("/checkout");
      return;
    }
    setIndex((i) => Math.min(i + 1, STEPS.length - 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }

  function back() {
    if (index === 0) {
      setStarted(false);
      if (typeof window !== "undefined") window.scrollTo({ top: 0 });
      return;
    }
    setIndex((i) => Math.max(i - 1, 0));
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }

  function skip() {
    setPlan({ bodyAnalysis: { ...plan.bodyAnalysis, skipped: true } });
    next();
  }

  const StepBody = step.Component;

  if (!started) {
    return (
      <BuildIntro
        onStart={() => {
          setStarted(true);
          if (typeof window !== "undefined") window.scrollTo({ top: 0 });
        }}
        onBack={() => router.push("/")}
      />
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-lg items-center justify-between px-4">
          <Link href="/" aria-label="Dr Diet home">
            <Logo variant="symbol" symbolClassName="h-7 w-auto" />
          </Link>
          <span className="text-sm font-semibold text-primary">Build my plan</span>
          <Link href="/" className="text-sm text-muted hover:text-primary">
            Save &amp; exit
          </Link>
        </div>
        <div className="mx-auto w-full max-w-lg px-4 pb-3">
          <SegmentedProgress total={STEPS.length} current={index + 1} />
        </div>
      </header>

      {/* Step content */}
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        <div className="mb-5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{step.title}</h1>
            {step.key === "body" && (
              <button
                onClick={skip}
                className="text-sm font-semibold text-primary underline underline-offset-2 hover:text-muted"
              >
                Skip for now
              </button>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">{step.subtitle}</p>
        </div>

        <StepBody />
      </main>

      {/* Bottom nav */}
      <div className="sticky bottom-0 border-t border-border bg-surface shadow-[var(--shadow-bar)]">
        <div className="mx-auto flex w-full max-w-lg items-center gap-3 px-4 py-3">
          <Button variant="ghost" onClick={back}>
            {index === 0 ? "Cancel" : "← Back"}
          </Button>
          <div className="flex-1" />
          {step.optional && step.key !== "body" && !canNextIsMeaningful(step, plan) && (
            <button onClick={next} className="text-sm text-muted hover:text-primary">
              Skip
            </button>
          )}
          <Button onClick={next} disabled={!canNext}>
            {isLast ? "Proceed to checkout" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// "Skip" link only makes sense on optional steps the user hasn't engaged with;
// keep it simple — always allow skip on optional steps except body (own link).
function canNextIsMeaningful(step: Step, p: PlanBuilderState): boolean {
  if (step.key === "allergies") return p.allergenIds.length > 0 || p.dislikes.length > 0;
  if (step.key === "preferences") return p.cuisinePrefs.length > 0;
  return true;
}
