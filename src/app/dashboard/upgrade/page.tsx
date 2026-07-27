"use client";

import Link from "next/link";
import { Badge, Card, CardBody } from "@/components/ui";
import { PlanCard } from "@/components/shared/PlanCard";
import { useDashboardData } from "@/lib/hooks/useDashboardData";
import { getPlans } from "@/lib/mock/catalog";
import { durationLabel, slotLabel } from "@/lib/format";

export default function UpgradePage() {
  const { loading, subscription } = useDashboardData();
  const plans = getPlans().slice(0, 3);

  if (loading) return <p className="py-10 text-center text-sm text-muted">Loading…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upgrade your plan</h1>
        <p className="text-sm text-muted">
          Commit longer to save more, add meals, or switch to a richer plan.
        </p>
      </div>

      {subscription && (
        <Card tone="canvas">
          <CardBody className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted">Current plan</p>
              <p className="font-bold">{subscription.planName}</p>
              <p className="text-xs text-muted">
                {durationLabel(subscription.duration)} ·{" "}
                {subscription.mealSlots.map(slotLabel).join(", ")}
              </p>
            </div>
            <Badge variant="success">Active</Badge>
          </CardBody>
        </Card>
      )}

      {/* Save-more upsell */}
      <Card>
        <CardBody className="space-y-3">
          <p className="text-sm font-semibold">Switch to a longer plan &amp; save</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { d: "weekly", note: "Flexible", save: "—" },
              { d: "monthly", note: "Most popular", save: "Save 10%" },
              { d: "quarterly", note: "Best value", save: "Save 18%" },
            ].map((o) => (
              <Link key={o.d} href="/build">
                <Card interactive>
                  <CardBody className="text-center">
                    <p className="font-bold">{durationLabel(o.d)}</p>
                    <p className="text-xs text-muted">{o.note}</p>
                    <Badge variant="accent" size="sm" className="mt-2">{o.save}</Badge>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
          <p className="text-xs text-muted">
            Reconfigure in the plan builder — your new plan starts at the next billing cycle.
          </p>
        </CardBody>
      </Card>

      {/* Switch plan */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Or switch plan</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {plans.map((p) => (
            <PlanCard key={p.id} plan={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
