import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Button, Card, CardBody } from "@/components/ui";
import { MacroBars, RatingStars } from "@/components/shared/bits";
import { MealCard } from "@/components/shared/MealCard";
import {
  getMealsByIds,
  getPlan,
  getReviews,
} from "@/lib/mock/catalog";
import { dietLabel, goalLabel, inr } from "@/lib/format";
import type { Meal } from "@/lib/types";

export default async function PlanDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plan = getPlan(id);
  if (!plan) notFound();

  const meals = getMealsByIds(plan.sample_meal_ids) as Meal[];
  const reviews = getReviews(plan.id).slice(0, 4);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <Link href="/explore" className="text-sm text-muted hover:text-primary">
        ← Back to plans
      </Link>

      {/* Header */}
      <div className="mt-4 grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="accent">{dietLabel(plan.diet_type)}</Badge>
            <Badge variant="surface">{goalLabel(plan.goal)}</Badge>
          </div>
          <h1 className="mt-3 flex items-center gap-3 text-3xl font-bold">
            <span aria-hidden>{plan.emoji}</span>
            {plan.name}
          </h1>
          <p className="mt-1 text-muted">{plan.tagline}</p>
          <div className="mt-3">
            <RatingStars rating={plan.rating} count={plan.review_count} />
          </div>
          <p className="mt-4 max-w-prose text-sm text-primary">{plan.description}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {plan.highlights.map((h) => (
              <Badge key={h} variant="neutral">
                {h}
              </Badge>
            ))}
          </div>
        </div>

        {/* Nutrition + CTA card */}
        <Card>
          <CardBody className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-muted">{plan.calories_per_day} kcal/day</p>
                <p className="text-2xl font-bold">
                  {inr(plan.price_per_day_inr)}
                  <span className="text-sm font-normal text-muted"> /day</span>
                </p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Macro split
              </p>
              <MacroBars split={plan.macro_split} />
            </div>
            <Link href={`/build?plan=${plan.id}`}>
              <Button fullWidth size="lg">
                Start this plan
              </Button>
            </Link>
            <Link href="/build">
              <Button fullWidth variant="ghost" size="sm">
                Customise it first
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>

      {/* Sample meals with allergen tags */}
      <section className="mt-10">
        <h2 className="mb-4 text-2xl font-bold">Sample meals</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {meals.map((m) => (
            <MealCard key={m.id} meal={m} />
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">What members say</h2>
          <Link href="/reviews" className="text-sm font-semibold text-primary hover:text-muted">
            All reviews →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {reviews.map((r) => (
            <Card key={r.id} tone="canvas">
              <CardBody>
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{r.user_name}</p>
                  <RatingStars rating={r.rating} />
                </div>
                {r.goal_tag && (
                  <Badge variant="neutral" size="sm" className="mt-2">
                    {r.goal_tag}
                  </Badge>
                )}
                <p className="mt-2 text-sm text-muted">{r.comment}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Sticky-ish bottom CTA */}
      <div className="mt-10 rounded-lg bg-primary p-6 text-center">
        <p className="text-lg font-bold text-primary-light">
          Ready to eat {plan.name}?
        </p>
        <div className="mt-3 flex justify-center">
          <Link href={`/build?plan=${plan.id}`}>
            <Button variant="accent" size="lg">
              Build & subscribe
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
