"use client";

import { TrendingUp } from "lucide-react";
import { Card, CardBody, PageLoader } from "@/components/ui";
import { useDashboardData } from "@/lib/hooks/useDashboardData";
import { goalLabel } from "@/lib/format";

export default function ProgressPage() {
  const { loading, subscription, orders } = useDashboardData();

  if (loading) return <PageLoader />;

  if (!subscription) {
    return (
      <div className="rounded-lg border border-border bg-surface p-10 text-center">
        <TrendingUp size={40} className="mx-auto text-neutral" aria-hidden />
        <p className="mt-3 font-semibold">No progress to show yet</p>
        <p className="mt-1 text-sm text-muted">Start a plan to begin tracking.</p>
      </div>
    );
  }

  const planned = orders.length;
  const skipped = orders.filter((o) => o.status === "skipped").length;
  const adherence = planned ? Math.round(((planned - skipped) / planned) * 100) : 100;

  // Illustrative weekly trend (demo).
  const trend =
    subscription.goal === "gain_muscle"
      ? [62, 62.4, 62.9, 63.3, 63.6, 64.1]
      : subscription.goal === "lose_weight"
        ? [78, 77.4, 76.9, 76.2, 75.6, 75.1]
        : [70, 70.1, 69.9, 70, 70.2, 70.1];
  const min = Math.min(...trend) - 1;
  const max = Math.max(...trend) + 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your progress</h1>
        <p className="text-sm text-muted">
          Goal: {goalLabel(subscription.goal)} · {subscription.caloriesPerDay} kcal/day
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Metric value={`${adherence}%`} label="Plan adherence" />
        <Metric value={`${planned - skipped}`} label="Meals on track" />
        <Metric value={`${Math.max(1, planned - skipped)}`} label="Day streak" />
      </div>

      <Card>
        <CardBody>
          <p className="mb-4 text-sm font-semibold">Weight trend (kg)</p>
          <div className="flex h-40 items-end gap-3">
            {trend.map((v, i) => {
              const h = ((v - min) / (max - min)) * 100;
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] text-muted">{v}</span>
                  <div
                    className="w-full rounded-t-sm bg-primary"
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[10px] text-muted">W{i + 1}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-muted">
            Illustrative trend — connect a smart scale or log weekly to track for real.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <Card tone="canvas">
      <CardBody className="text-center">
        <p className="text-2xl font-bold text-primary">{value}</p>
        <p className="text-[11px] text-muted">{label}</p>
      </CardBody>
    </Card>
  );
}
