"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge, Button, Card, CardBody, PageLoader } from "@/components/ui";
import { PageHeader, StatusPill } from "@/components/admin/bits";
import { useAdmin } from "@/lib/admin/useAdmin";
import { adminStore } from "@/lib/admin/store";
import { getAllergen } from "@/lib/mock/catalog";
import {
  dietLabel,
  durationLabel,
  goalLabel,
  inr,
  longDate,
  shortDate,
  slotLabel,
} from "@/lib/format";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { hydrated, tick, refresh } = useAdmin();

  const detail = useMemo(
    () => (hydrated ? adminStore.customerDetail(id) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tick re-reads the store after mutations
    [hydrated, id, tick],
  );

  if (!hydrated) return <PageLoader />;
  if (!detail?.customer) {
    return (
      <Card>
        <CardBody className="py-10 text-center text-sm text-muted">
          Customer not found.{" "}
          <Link href="/admin/customers" className="font-semibold text-primary">Back to list</Link>
        </CardBody>
      </Card>
    );
  }

  const { customer: c, subscription: sub, orders, invoices, payments, tickets } = detail;
  const suspended = c.status === "suspended";

  return (
    <>
      <Link href="/admin/customers" className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-primary">
        <ArrowLeft size={15} /> Customers
      </Link>

      <PageHeader title={c.name} subtitle={c.email}>
        <Button size="sm" variant={suspended ? "primary" : "outline"} onClick={() => { adminStore.updateCustomer(c.id, { status: suspended ? "active" : "suspended" }); refresh(); }}>
          {suspended ? "Reactivate" : "Suspend"}
        </Button>
        <Button size="sm" variant="danger" onClick={() => {
          if (confirm(`Delete ${c.name} and all their data? This cannot be undone.`)) {
            adminStore.removeCustomer(c.id);
            router.push("/admin/customers");
          }
        }}>
          Delete
        </Button>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Profile */}
        <Card>
          <CardBody className="space-y-2 text-sm">
            <div className="flex items-center justify-between"><span className="text-muted">Status</span><StatusPill status={c.status} /></div>
            <Info label="Phone" value={`+91 ${c.phone}`} badge={c.phoneVerified ? "Verified" : "Unverified"} ok={c.phoneVerified} />
            <Info label="Email" value={c.email} badge={c.emailVerified ? "Verified" : "Unverified"} ok={c.emailVerified} />
            <Row label="City" value={c.city} />
            <Row label="Diet" value={dietLabel(c.diet)} />
            <Row label="Goal" value={goalLabel(c.goal)} />
            <Row label="Joined" value={longDate(c.createdAt)} />
            <div className="flex justify-between gap-4">
              <span className="text-muted">Allergies</span>
              <span className="text-right text-primary">
                {c.allergyIds.length ? c.allergyIds.map((a) => getAllergen(a)?.name).filter(Boolean).join(", ") : "None"}
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Subscription */}
        <Card className="lg:col-span-2">
          <CardBody>
            <p className="mb-3 text-sm font-semibold">Subscription</p>
            {!sub ? (
              <p className="text-sm text-muted">No subscription.</p>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-lg font-bold">{sub.planName}</p>
                    <p className="text-xs text-muted">
                      {durationLabel(sub.duration)} · {sub.mealSlots.map(slotLabel).join(", ")} · {sub.caloriesPerDay} kcal/day
                    </p>
                  </div>
                  <StatusPill status={sub.status} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                  <span>Total: <strong>{inr(sub.totalPriceInr)}</strong></span>
                  <span className="text-muted">Started {shortDate(sub.startDate)}</span>
                  <span className="text-muted capitalize">{sub.billingCadence.replace("_", " ")}</span>
                </div>
                {sub.status !== "cancelled" && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" variant={sub.status === "paused" ? "primary" : "outline"} onClick={() => { adminStore.setSubscriptionStatus(sub.id, sub.status === "paused" ? "active" : "paused"); refresh(); }}>
                      {sub.status === "paused" ? "Resume plan" : "Pause plan"}
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => { if (confirm("Cancel this subscription?")) { adminStore.setSubscriptionStatus(sub.id, "cancelled"); refresh(); } }}>
                      Cancel plan
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Orders */}
      <Card className="mt-4">
        <CardBody>
          <p className="mb-3 text-sm font-semibold">Recent orders ({orders.length})</p>
          <div className="divide-y divide-border">
            {orders.slice(0, 8).map((o) => (
              <div key={o.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <span className="font-medium">{o.mealName}</span>
                  <span className="ml-2 text-xs text-muted">{slotLabel(o.mealSlot)} · {shortDate(o.deliveryDate)}</span>
                </div>
                <StatusPill status={o.status} />
              </div>
            ))}
            {orders.length === 0 && <p className="py-2 text-sm text-muted">No orders yet.</p>}
          </div>
        </CardBody>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardBody>
            <p className="mb-3 text-sm font-semibold">Payments & invoices</p>
            <div className="space-y-2 text-sm">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <span className="capitalize text-muted">{p.method} · {shortDate(p.date)}</span>
                  <span className="flex items-center gap-2"><strong>{inr(p.amountInr)}</strong><StatusPill status={p.status} /></span>
                </div>
              ))}
              {invoices.map((i) => (
                <div key={i.id} className="flex items-center justify-between text-xs text-muted">
                  <span>Invoice #{i.id.slice(-6).toUpperCase()}</span>
                  <span>incl. GST {inr(i.gstInr)}</span>
                </div>
              ))}
              {payments.length === 0 && <p className="text-muted">No payments.</p>}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="mb-3 text-sm font-semibold">Support tickets</p>
            {tickets.length === 0 ? (
              <p className="text-sm text-muted">No tickets.</p>
            ) : (
              <div className="space-y-2">
                {tickets.map((t) => (
                  <Link key={t.id} href="/admin/support" className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm hover:bg-primary-light">
                    <span className="truncate">{t.subject}</span>
                    <StatusPill status={t.status} />
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium text-primary">{value}</span>
    </div>
  );
}

function Info({ label, value, badge, ok }: { label: string; value: string; badge: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className="flex items-center gap-2 text-right font-medium text-primary">
        <span className="truncate">{value}</span>
        <Badge variant={ok ? "success" : "surface"} size="sm">{badge}</Badge>
      </span>
    </div>
  );
}
