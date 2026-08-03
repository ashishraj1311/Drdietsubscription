"use client";

import { useMemo, useState } from "react";
import { Button, Card, Chip, PageLoader } from "@/components/ui";
import { PageHeader, StatTile, StatusPill } from "@/components/admin/bits";
import { useAdmin } from "@/lib/admin/useAdmin";
import { adminStore } from "@/lib/admin/store";
import { inr, shortDate } from "@/lib/format";
import type { AdminPayment } from "@/lib/admin/types";

type Filter = "all" | AdminPayment["status"];

export default function PaymentsPage() {
  const { hydrated, tick, refresh } = useAdmin();
  const [filter, setFilter] = useState<Filter>("all");

  const { rows, collected, refunded, failedCount } = useMemo(() => {
    if (!hydrated) return { rows: [], collected: 0, refunded: 0, failedCount: 0 };
    const customers = adminStore.customers();
    const name = (id: string) => customers.find((c) => c.id === id)?.name ?? "—";
    const all = adminStore.payments();
    return {
      rows: all
        .filter((p) => filter === "all" || p.status === filter)
        .map((p) => ({ p, name: name(p.customerId) })),
      collected: all.filter((p) => p.status === "success").reduce((s, p) => s + p.amountInr, 0),
      refunded: all.filter((p) => p.status === "refunded").reduce((s, p) => s + p.amountInr, 0),
      failedCount: all.filter((p) => p.status === "failed").length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tick re-reads the store after mutations
  }, [hydrated, tick, filter]);

  if (!hydrated) return <PageLoader />;

  return (
    <>
      <PageHeader title="Payments" subtitle="Transactions across all customers (₹)." />

      <div className="mb-4 grid grid-cols-3 gap-4">
        <StatTile label="Collected" value={inr(collected)} sub="Successful" />
        <StatTile label="Refunded" value={inr(refunded)} />
        <StatTile label="Failed" value={String(failedCount)} sub="Transactions" />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "success", "failed", "refunded"] as Filter[]).map((f) => (
          <Chip key={f} selected={filter === f} onClick={() => setFilter(f)}>{f === "all" ? "All" : f[0].toUpperCase() + f.slice(1)}</Chip>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Txn</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ p, name }) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-muted">{p.id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3 font-medium">{name}</td>
                  <td className="px-4 py-3 capitalize">{p.method}</td>
                  <td className="px-4 py-3 font-semibold">{inr(p.amountInr)}</td>
                  <td className="px-4 py-3 text-muted">{shortDate(p.date)}</td>
                  <td className="px-4 py-3"><StatusPill status={p.status} /></td>
                  <td className="px-4 py-3 text-right">
                    {p.status === "success" ? (
                      <Button size="sm" variant="outline" onClick={() => { if (confirm(`Refund ${inr(p.amountInr)} to ${name}?`)) { adminStore.refundPayment(p.id); refresh(); } }}>Refund</Button>
                    ) : <span className="text-xs text-muted">—</span>}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted">No payments.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
