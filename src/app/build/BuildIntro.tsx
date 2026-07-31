"use client";

import { ArrowLeft, Check, Salad } from "lucide-react";
import { Button } from "@/components/ui";

const BENEFITS = [
  "Pick your goal, meals & calorie range",
  "Choose diet type & flag allergens",
  "Swap proteins & customise portions",
  "Free delivery · pause or cancel anytime",
];

/**
 * BuildIntro — the landing screen for the Build Your Own Plan flow (Figma: BYOP · Intro).
 * Sits before the 9-step wizard; "Start building" enters the Goal step.
 */
export function BuildIntro({
  onStart,
  onBack,
}: {
  onStart: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex min-h-full flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-lg items-center gap-3 px-4">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="text-primary hover:text-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold">Build your plan</span>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-lg flex-1 space-y-6 px-4 py-5">
        {/* Hero banner */}
        <div
          className="relative overflow-hidden rounded-lg p-5"
          style={{
            background:
              "linear-gradient(135deg, #16210f 0%, #2b4023 55%, #3e5a33 100%)",
          }}
        >
          <div className="max-w-[62%]">
            <h1
              className="font-bold uppercase leading-[1.05] tracking-tight"
              style={{ color: "#dbe45a", fontSize: "1.6rem" }}
            >
              Build your
              <br />
              own plan
            </h1>
            <p className="mt-3 text-sm leading-snug text-white/85">
              Decide the type and number of meals based on your eating habits
              and calorie needs.
            </p>
          </div>
          {/* Food image placeholder — replace with real dish photo */}
          <div
            className="absolute right-4 top-1/2 flex h-[76%] w-[30%] -translate-y-1/2 items-center justify-center rounded-md"
            style={{ background: "rgba(255,255,255,0.10)" }}
            aria-hidden
          >
            <Salad className="h-9 w-9 text-white/70" />
          </div>
        </div>

        {/* About */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Your plan, your way</h2>
          <p className="text-sm leading-relaxed text-muted">
            Tailor every meal to how you actually eat. Set your goal, meals,
            diet, calories and schedule — then fine-tune proteins and portions.
            Delivered fresh; pause or cancel anytime.
          </p>
        </div>

        {/* Benefits */}
        <ul className="space-y-3">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-center gap-2.5">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary"
                aria-hidden
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              <span className="text-sm font-semibold text-muted">{b}</span>
            </li>
          ))}
        </ul>
      </main>

      {/* Bottom CTA */}
      <div className="sticky bottom-0 border-t border-border bg-surface shadow-[var(--shadow-bar)]">
        <div className="mx-auto w-full max-w-lg space-y-1.5 px-4 py-3">
          <Button fullWidth size="lg" onClick={onStart}>
            Start building
          </Button>
          <p className="text-center text-xs text-muted">
            About 2 minutes · 9 quick steps
          </p>
        </div>
      </div>
    </div>
  );
}
