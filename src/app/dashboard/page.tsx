"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Badge,
  BottomSheet,
  Button,
  Card,
  CardBody,
  Chip,
} from "@/components/ui";
import { useDashboardData } from "@/lib/hooks/useDashboardData";
import { api } from "@/lib/mock/api";
import { DELIVERY_SLOTS } from "@/lib/mock/seed";
import { durationLabel, inr, shortDate, slotLabel } from "@/lib/format";
import type { Order } from "@/lib/types";

export default function DashboardHome() {
  const { loading, subscription, orders, refresh } = useDashboardData();
  const [busy, setBusy] = useState<string | null>(null);
  const [timeSheet, setTimeSheet] = useState(false);
  const [addrSheet, setAddrSheet] = useState(false);
  const [newSlot, setNewSlot] = useState<string>("");
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  if (loading) {
    return <p className="py-10 text-center text-sm text-muted">Loading your dashboard…</p>;
  }

  if (!subscription) {
    return (
      <div className="rounded-lg border border-border bg-surface p-10 text-center">
        <p className="text-4xl" aria-hidden>🍽️</p>
        <h1 className="mt-3 text-xl font-bold">No active plan yet</h1>
        <p className="mt-1 text-sm text-muted">
          Build your first plan and your deliveries will show up here.
        </p>
        <Link href="/build" className="mt-4 inline-block">
          <Button size="lg">Build my plan</Button>
        </Link>
      </div>
    );
  }

  const paused = subscription.status === "paused";
  const activeOrders = orders.filter((o) => o.status !== "delivered");
  const dates = Array.from(new Set(activeOrders.map((o) => o.deliveryDate))).sort();
  const todayDate = dates[0];
  const todayOrders = activeOrders.filter((o) => o.deliveryDate === todayDate);
  const upcoming = activeOrders.filter((o) => o.deliveryDate !== todayDate);

  async function togglePause() {
    setBusy("pause");
    await api.setSubscriptionStatus(subscription!.id, paused ? "active" : "paused");
    refresh();
    setBusy(null);
  }

  async function skip(order: Order) {
    setBusy(order.id);
    await api.setOrderStatus(order.id, "skipped");
    refresh();
    setBusy(null);
  }

  async function unskip(order: Order) {
    setBusy(order.id);
    await api.setOrderStatus(order.id, "upcoming");
    refresh();
    setBusy(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your kitchen</h1>
        <p className="text-sm text-muted">Manage today&apos;s meals and what&apos;s coming up.</p>
      </div>

      {/* Plan card */}
      <Card>
        <CardBody className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold">{subscription.planName}</p>
                <Badge variant={paused ? "surface" : "success"}>
                  {paused ? "Paused" : "Active"}
                </Badge>
              </div>
              <p className="text-xs text-muted">
                {durationLabel(subscription.duration)} ·{" "}
                {subscription.mealSlots.map(slotLabel).join(", ")} ·{" "}
                {subscription.caloriesPerDay} kcal/day
              </p>
            </div>
            <p className="text-right text-sm font-bold">
              {inr(subscription.totalPriceInr)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={paused ? "primary" : "outline"} disabled={busy === "pause"} onClick={togglePause}>
              {busy === "pause" ? "…" : paused ? "Resume plan" : "Pause plan"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setTimeSheet(true)}>
              Change delivery time
            </Button>
            <Button size="sm" variant="outline" onClick={() => setAddrSheet(true)}>
              Change address
            </Button>
            <Link href="/dashboard/upgrade">
              <Button size="sm" variant="accent">Upgrade plan</Button>
            </Link>
          </div>
          {savedMsg && <p className="text-xs text-success">{savedMsg}</p>}
        </CardBody>
      </Card>

      {/* Today */}
      <section>
        <h2 className="mb-2 text-lg font-semibold">
          {todayDate ? `Next delivery · ${shortDate(todayDate)}` : "Next delivery"}
        </h2>
        {todayOrders.length === 0 ? (
          <Card tone="canvas"><CardBody className="text-sm text-muted">Nothing scheduled.</CardBody></Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {todayOrders.map((o) => (
              <OrderRow key={o.id} order={o} busy={busy === o.id} onSkip={() => skip(o)} onUnskip={() => unskip(o)} paused={paused} />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-semibold">Upcoming deliveries</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {upcoming.slice(0, 8).map((o) => (
              <OrderRow key={o.id} order={o} busy={busy === o.id} onSkip={() => skip(o)} onUnskip={() => unskip(o)} paused={paused} />
            ))}
          </div>
          <div className="mt-3">
            <Link href="/dashboard/orders" className="text-sm font-semibold text-primary hover:text-muted">
              View all orders →
            </Link>
          </div>
        </section>
      )}

      {/* Helpful links */}
      <div className="grid gap-3 sm:grid-cols-3">
        <LinkCard href="/dashboard/progress" icon="📈" title="Track progress" sub="See goal progress over time" />
        <LinkCard href="/dashboard/invoices" icon="🧾" title="Invoices" sub="Download your ₹ invoices" />
        <LinkCard href="/dashboard/support" icon="💬" title="Support" sub="We're here to help" />
      </div>

      {/* Change time sheet */}
      <BottomSheet open={timeSheet} onClose={() => setTimeSheet(false)} title="Change delivery time">
        <p className="mb-3 text-sm text-muted">
          Changes apply from tomorrow. Requests must be made before 12:00 noon the day before.
        </p>
        <div className="flex flex-wrap gap-2">
          {DELIVERY_SLOTS.map((s) => (
            <Chip key={s} selected={newSlot === s} onClick={() => setNewSlot(s)}>{s}</Chip>
          ))}
        </div>
        <Button fullWidth className="mt-5" disabled={!newSlot} onClick={() => {
          setTimeSheet(false);
          setSavedMsg(`Delivery time updated to ${newSlot} from tomorrow.`);
        }}>
          Save new time
        </Button>
      </BottomSheet>

      {/* Change address sheet */}
      <BottomSheet open={addrSheet} onClose={() => setAddrSheet(false)} title="Change delivery address">
        <p className="mb-3 text-sm text-muted">
          Update where your meals arrive. Serviceability is re-checked on save.
        </p>
        <Button fullWidth onClick={() => {
          setAddrSheet(false);
          setSavedMsg("Address update requested — we'll confirm serviceability shortly.");
        }}>
          Update address
        </Button>
      </BottomSheet>
    </div>
  );
}

function OrderRow({
  order,
  busy,
  onSkip,
  onUnskip,
  paused,
}: {
  order: Order;
  busy: boolean;
  onSkip: () => void;
  onUnskip: () => void;
  paused: boolean;
}) {
  const skipped = order.status === "skipped";
  const isPaused = order.status === "paused" || paused;
  return (
    <Card tone="canvas">
      <CardBody className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted">{slotLabel(order.mealSlot)} · {shortDate(order.deliveryDate)}</p>
          <p className="truncate font-semibold">{order.mealName}</p>
          {skipped && <Badge variant="surface" size="sm" className="mt-1">Skipped</Badge>}
          {isPaused && !skipped && <Badge variant="surface" size="sm" className="mt-1">Paused</Badge>}
        </div>
        {skipped ? (
          <Button size="sm" variant="ghost" disabled={busy} onClick={onUnskip}>Undo</Button>
        ) : (
          <Button size="sm" variant="outline" disabled={busy || isPaused} onClick={onSkip}>
            {busy ? "…" : "Skip"}
          </Button>
        )}
      </CardBody>
    </Card>
  );
}

function LinkCard({ href, icon, title, sub }: { href: string; icon: string; title: string; sub: string }) {
  return (
    <Link href={href}>
      <Card interactive>
        <CardBody>
          <div className="text-2xl" aria-hidden>{icon}</div>
          <p className="mt-2 font-bold">{title}</p>
          <p className="text-xs text-muted">{sub}</p>
        </CardBody>
      </Card>
    </Link>
  );
}
