import Link from "next/link";
import { Badge, Button, Card, CardBody } from "@/components/ui";
import { PlanCard } from "@/components/shared/PlanCard";
import { MealCard } from "@/components/shared/MealCard";
import { RatingStars, TrustBadges } from "@/components/shared/bits";
import { avgRating, getMeals, getPlans, getReviews } from "@/lib/mock/catalog";

export default function HomePage() {
  const plans = getPlans().slice(0, 3);
  const meals = getMeals().slice(0, 3);
  const rating = avgRating();
  const reviewCount = getReviews().length * 40; // demo-scaled

  return (
    <main>
      {/* Hero */}
      <section className="mx-auto w-full max-w-5xl px-4 pt-12 pb-6 sm:px-6">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <Badge variant="accent">India&apos;s fitness-first meal plan</Badge>
            <h1 className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
              Eat <span className="font-accent text-primary">What&apos;s Right</span>,
              <br />
              without the planning.
            </h1>
            <p className="mt-4 max-w-md text-sm text-muted sm:text-base">
              Nutritionally balanced meals matched to your fitness goal and
              delivered on your schedule. Try 3 meals before you commit — no other
              brand lets you.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href="/build">
                <Button size="lg">Build my plan</Button>
              </Link>
              <Link href="/explore">
                <Button size="lg" variant="outline">
                  Explore plans
                </Button>
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-4">
              <RatingStars rating={rating} count={reviewCount} />
              <span className="text-xs text-muted">Loved by gym-goers across India</span>
            </div>
          </div>

          <Card className="md:justify-self-end md:w-full">
            <CardBody className="space-y-4">
              <p className="text-sm font-semibold text-muted">This week, on the menu</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {getMeals()
                  .slice(0, 6)
                  .map((m) => (
                    <div
                      key={m.id}
                      className="rounded-md border border-border bg-primary-light p-2"
                    >
                      <div className="text-3xl" aria-hidden>
                        {m.emoji}
                      </div>
                      <p className="mt-1 line-clamp-2 text-[11px] font-medium text-primary">
                        {m.name}
                      </p>
                    </div>
                  ))}
              </div>
              <Link href="/menu">
                <Button fullWidth variant="accent">
                  See this week&apos;s full menu
                </Button>
              </Link>
            </CardBody>
          </Card>
        </div>

        <TrustBadges className="mt-8" />
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { n: "1", t: "Tell us your goal", d: "Lose weight, gain muscle or just eat better. Body stats optional." },
            { n: "2", t: "We match your meals", d: "Diet, allergies and portions dialled in to your calorie target." },
            { n: "3", t: "Delivered daily", d: "Fresh meals on your schedule. Skip, pause or change anytime." },
          ].map((s) => (
            <Card key={s.n} tone="canvas">
              <CardBody>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-bold text-primary">
                  {s.n}
                </div>
                <h3 className="mt-3 text-base font-bold">{s.t}</h3>
                <p className="mt-1 text-sm text-muted">{s.d}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Plan tiers preview */}
      <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-bold">Popular plans</h2>
          <Link href="/explore" className="text-sm font-semibold text-primary hover:text-muted">
            View all →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {plans.map((p) => (
            <PlanCard key={p.id} plan={p} />
          ))}
        </div>
      </section>

      {/* Menu teaser */}
      <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-bold">Real food, real macros</h2>
          <Link href="/menu" className="text-sm font-semibold text-primary hover:text-muted">
            Full menu →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {meals.map((m) => (
            <MealCard key={m.id} meal={m} />
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <Card className="bg-primary text-primary-light">
          <CardBody className="flex flex-col items-center gap-4 py-10 text-center">
            <h2 className="text-3xl font-bold text-primary-light">
              Not sure yet? Try 3 meals first.
            </h2>
            <p className="max-w-md text-sm text-primary-light/80">
              Our trial pack lets you taste before committing to a weekly or
              monthly plan. Cancel anytime — no auto-renewal on trials.
            </p>
            <Link href="/build">
              <Button size="lg" variant="accent">
                Start with a trial
              </Button>
            </Link>
          </CardBody>
        </Card>
      </section>
    </main>
  );
}
