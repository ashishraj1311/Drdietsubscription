"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CreditCard, Package, TrendingUp, Users } from "lucide-react";
import { Card, CardBody, PageLoader } from "@/components/ui";
import { MiniBarChart, PageHeader, StatTile } from "@/components/admin/bits";
import { useAdmin } from "@/lib/admin/useAdmin";
import { adminStore } from "@/lib/admin/store";
import { dietLabel, inr } from "@/lib/format";

export default function AdminOverview() {
  const { hydrated, tick } = useAdmin();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- tick re-reads the store after mutations
  const k = useMemo(() => (hydrated ? adminStore.kpis() : null), [hydrated, tick]);

  if (!k) return <PageLoader label="Crunching numbers…" />;

  const maxPlan = Math.max(1, ...k.planMix.map((p) => p.count));
  const totalDiet = Math.max(1, k.dietMix.reduce((s, d) => s + d.count, 0));

  return (
    <>
      <PageHeader title="Overview" subtitle="How Dr Diet is doing right now." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Active subscribers" value={String(k.activeSubscribers)} sub={`${k.pausedSubscribers} paused · ${k.cancelled} cancelled`} icon={<Users size={18} />} accent />
        <StatTile label="Est. MRR" value={inr(k.mrrInr)} sub="Monthly recurring" icon={<TrendingUp size={18} />} />
        <StatTile label="Revenue collected" value={inr(k.revenueCollectedInr)} sub="All-time (paid)" icon={<CreditCard size={18} />} />
        <StatTile label="Deliveries today" value={String(k.ordersToday)} sub={`${k.openTickets} open tickets`} icon={<Package size={18} />} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardBody>
            <p className="mb-4 text-sm font-semibold">Revenue · last 6 months</p>
            <MiniBarChart data={k.revenueByMonth} />
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="mb-3 text-sm font-semibold">Diet mix</p>
            <div className="space-y-2">
              {k.dietMix.map((d) => (
                <div key={d.diet} className="flex items-center gap-3">
                  <span className="w-20 text-xs text-muted">{dietLabel(d.diet)}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral/20">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(d.count / totalDiet) * 100}%` }} />
                  </div>
                  <span className="w-6 text-right text-xs font-semibold">{d.count}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardBody>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Plans by subscribers</p>
              <Link href="/admin/subscriptions" className="text-xs font-semibold text-primary hover:text-muted">
                View all →
              </Link>
            </div>
            <div className="space-y-2">
              {k.planMix.map((p) => (
                <div key={p.plan} className="flex items-center gap-3">
                  <span className="w-32 truncate text-xs text-muted">{p.plan}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral/20">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${(p.count / maxPlan) * 100}%` }} />
                  </div>
                  <span className="w-6 text-right text-xs font-semibold">{p.count}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="mb-3 text-sm font-semibold">Quick actions</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { href: "/admin/orders", label: "Today's kitchen manifest" },
                { href: "/admin/customers", label: "Manage customers" },
                { href: "/admin/coupons", label: "Create a coupon" },
                { href: "/admin/support", label: "Answer support" },
              ].map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="rounded-md border border-border px-3 py-3 font-medium text-primary transition-colors hover:border-neutral hover:bg-primary-light"
                >
                  {a.label} →
                </Link>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
