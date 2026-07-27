"use client";

import Link from "next/link";
import { PackageOpen } from "lucide-react";
import { Badge, Button, Card, CardBody, PageLoader } from "@/components/ui";
import { useDashboardData } from "@/lib/hooks/useDashboardData";
import { shortDate, slotLabel } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

const STATUS_VARIANT: Record<OrderStatus, "success" | "surface" | "neutral" | "danger"> = {
  delivered: "success",
  upcoming: "neutral",
  skipped: "surface",
  paused: "surface",
};

export default function OrdersPage() {
  const { loading, subscription, orders } = useDashboardData();

  if (loading) return <PageLoader />;

  if (!subscription) {
    return (
      <EmptyState />
    );
  }

  // group by date
  const byDate = new Map<string, typeof orders>();
  orders.forEach((o) => {
    const arr = byDate.get(o.deliveryDate) ?? [];
    arr.push(o);
    byDate.set(o.deliveryDate, arr);
  });
  const dates = [...byDate.keys()].sort();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Order history</h1>
        <p className="text-sm text-muted">Every delivery for {subscription.planName}.</p>
      </div>

      {dates.length === 0 ? (
        <Card><CardBody className="text-sm text-muted">No orders yet.</CardBody></Card>
      ) : (
        dates.map((d) => (
          <section key={d}>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
              {shortDate(d)}
            </h2>
            <Card>
              <CardBody className="divide-y divide-border p-0">
                {byDate.get(d)!.map((o) => (
                  <div key={o.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="font-semibold">{o.mealName}</p>
                      <p className="text-xs text-muted">{slotLabel(o.mealSlot)}</p>
                    </div>
                    <Badge variant={STATUS_VARIANT[o.status]} size="sm">
                      {o.status[0].toUpperCase() + o.status.slice(1)}
                    </Badge>
                  </div>
                ))}
              </CardBody>
            </Card>
          </section>
        ))
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-border bg-surface p-10 text-center">
      <PackageOpen size={40} className="mx-auto text-neutral" aria-hidden />
      <p className="mt-3 font-semibold">No orders yet</p>
      <Link href="/build" className="mt-4 inline-block">
        <Button>Build a plan</Button>
      </Link>
    </div>
  );
}
