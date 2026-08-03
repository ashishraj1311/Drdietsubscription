"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Card, CardBody, PageLoader } from "@/components/ui";
import { PageHeader, StatTile, StatusPill } from "@/components/admin/bits";
import { useAdmin } from "@/lib/admin/useAdmin";
import { adminStore } from "@/lib/admin/store";
import { longDate, slotLabel } from "@/lib/format";
import type { MealSlot } from "@/lib/types";

const SLOTS: MealSlot[] = ["breakfast", "lunch", "evening_snack", "dinner"];

function isoForOffset(offset: number) {
  const d = new Date();
  d.setHours(9, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d.toISOString();
}

export default function OrdersPage() {
  const { hydrated, tick, refresh } = useAdmin();
  const [offset, setOffset] = useState(0);
  const dateISO = isoForOffset(offset);

  const { orders, custName } = useMemo(() => {
    const subs = hydrated ? adminStore.subscriptions() : [];
    const customers = hydrated ? adminStore.customers() : [];
    const subToCust = new Map(subs.map((s) => [s.id, customers.find((c) => c.id === s.userId)]));
    const lookup = (subId: string) => subToCust.get(subId)?.name ?? "—";
    return { orders: hydrated ? adminStore.ordersOn(dateISO) : [], custName: lookup };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tick re-reads the store after mutations
  }, [hydrated, tick, dateISO]);

  if (!hydrated) return <PageLoader />;

  const active = orders.filter((o) => o.status !== "skipped");
  const slotCounts = SLOTS.map((s) => ({ slot: s, count: active.filter((o) => o.mealSlot === s).length }));
  // cook list: meal -> count (excluding skipped)
  const cook = new Map<string, number>();
  active.forEach((o) => cook.set(o.mealName, (cook.get(o.mealName) ?? 0) + 1));
  const cookList = [...cook.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <>
      <PageHeader title="Orders & Kitchen" subtitle="Delivery manifest and what to cook.">
        <div className="flex items-center gap-1 rounded-md border border-border bg-surface">
          <button className="px-2 py-1.5 text-muted hover:text-primary" onClick={() => setOffset((o) => o - 1)} aria-label="Previous day"><ChevronLeft size={16} /></button>
          <span className="px-2 text-sm font-semibold">{offset === 0 ? "Today" : longDate(dateISO)}</span>
          <button className="px-2 py-1.5 text-muted hover:text-primary" onClick={() => setOffset((o) => o + 1)} aria-label="Next day"><ChevronRight size={16} /></button>
        </div>
        {offset !== 0 && <Button size="sm" variant="ghost" onClick={() => setOffset(0)}>Today</Button>}
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {slotCounts.map((s) => (
          <StatTile key={s.slot} label={slotLabel(s.slot)} value={String(s.count)} sub="portions" />
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Cook list */}
        <Card>
          <CardBody>
            <p className="mb-3 text-sm font-semibold">Cook list · {active.length} portions</p>
            {cookList.length === 0 ? (
              <p className="text-sm text-muted">No deliveries scheduled.</p>
            ) : (
              <div className="space-y-2">
                {cookList.map(([meal, count]) => (
                  <div key={meal} className="flex items-center justify-between border-b border-border pb-2 last:border-0 text-sm">
                    <span className="font-medium">{meal}</span>
                    <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-light">×{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Delivery list */}
        <Card>
          <CardBody>
            <p className="mb-3 text-sm font-semibold">Deliveries</p>
            {orders.length === 0 ? (
              <p className="text-sm text-muted">Nothing scheduled for this day.</p>
            ) : (
              <div className="max-h-[420px] space-y-2 overflow-y-auto">
                {orders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between gap-2 border-b border-border pb-2 last:border-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{custName(o.subscriptionId)}</p>
                      <p className="truncate text-xs text-muted">{slotLabel(o.mealSlot)} · {o.mealName}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <StatusPill status={o.status} />
                      {o.status !== "delivered" && o.status !== "skipped" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => { adminStore.setOrderStatus(o.id, "delivered"); refresh(); }}>Delivered</Button>
                          <Button size="sm" variant="ghost" onClick={() => { adminStore.setOrderStatus(o.id, "skipped"); refresh(); }}>Skip</Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
