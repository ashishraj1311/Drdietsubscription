"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button, Chip, PageLoader } from "@/components/ui";
import { PageHeader, StatusPill } from "@/components/admin/bits";
import { Card } from "@/components/ui";
import { useAdmin } from "@/lib/admin/useAdmin";
import { adminStore } from "@/lib/admin/store";
import { durationLabel, inr, slotLabel } from "@/lib/format";
import type { Subscription } from "@/lib/types";

type Filter = "all" | Subscription["status"];

export default function SubscriptionsPage() {
  const { hydrated, tick, refresh } = useAdmin();
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(() => {
    if (!hydrated) return [];
    const subs = adminStore.subscriptions();
    return subs
      .filter((s) => filter === "all" || s.status === filter)
      .map((s) => ({ sub: s, customer: adminStore.customerFor(s) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tick re-reads the store after mutations
  }, [hydrated, tick, filter]);

  if (!hydrated) return <PageLoader />;

  return (
    <>
      <PageHeader title="Subscriptions" subtitle={`${adminStore.subscriptions().length} total`} />

      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "active", "paused", "cancelled"] as Filter[]).map((f) => (
          <Chip key={f} selected={filter === f} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f[0].toUpperCase() + f.slice(1)}
          </Chip>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ sub, customer }) => (
                <tr key={sub.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    {customer ? (
                      <Link href={`/admin/customers/${customer.id}`} className="font-semibold text-primary hover:underline">
                        {customer.name}
                      </Link>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{sub.planName}</div>
                    <div className="text-xs text-muted">{sub.mealSlots.map(slotLabel).join(", ")}</div>
                  </td>
                  <td className="px-4 py-3">{durationLabel(sub.duration)}</td>
                  <td className="px-4 py-3 font-semibold">{inr(sub.totalPriceInr)}</td>
                  <td className="px-4 py-3"><StatusPill status={sub.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      {sub.status !== "cancelled" ? (
                        <>
                          <Button size="sm" variant="outline" onClick={() => { adminStore.setSubscriptionStatus(sub.id, sub.status === "paused" ? "active" : "paused"); refresh(); }}>
                            {sub.status === "paused" ? "Resume" : "Pause"}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { if (confirm("Cancel this subscription?")) { adminStore.setSubscriptionStatus(sub.id, "cancelled"); refresh(); } }}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted">No subscriptions.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
