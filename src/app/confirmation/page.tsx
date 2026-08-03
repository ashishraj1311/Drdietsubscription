"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CircleCheckBig } from "lucide-react";
import { Badge, Button, Card, CardBody, Logo, PageLoader } from "@/components/ui";
import { useAuth, useBuilder } from "@/lib/providers";
import { api } from "@/lib/mock/api";
import { billingSentence } from "@/lib/pricing";
import { durationLabel, inr, longDate, slotLabel } from "@/lib/format";
import type { Subscription } from "@/lib/types";

export default function ConfirmationPage() {
  const { user, hydrated } = useAuth();
  const { resetAll } = useBuilder();
  const [sub, setSub] = useState<Subscription | null | undefined>(undefined);

  useEffect(() => {
    if (!hydrated) return;
    // Read the persisted subscription after hydration, then clear the builder
    // working state now that the order is placed.
    let active = true;
    if (user) {
      api.getActiveSubscription(user.id).then((s) => {
        if (active) setSub(s);
      });
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSub(null);
    }
    resetAll();
    return () => {
      active = false;
    };
  }, [hydrated, user, resetAll]);

  if (sub === undefined) {
    return <PageLoader />;
  }

  if (!sub) {
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <p className="text-sm text-muted">No active subscription found.</p>
        <Link href="/build" className="mt-4 inline-block">
          <Button>Build a plan</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-col px-4 py-8">
      <div className="mb-6 flex justify-center">
        <Logo variant="full" className="text-lg" />
      </div>

      <div className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/20 text-success">
          <CircleCheckBig size={40} aria-hidden />
        </div>
        <h1 className="mt-5 text-3xl font-bold">You&apos;re all set!</h1>
        <p className="mt-2 max-w-sm text-sm text-muted">
          Your {sub.planName} is confirmed. Relax — we&apos;ll take it from here and
          have fresh meals at your door.
        </p>
      </div>

      <Card className="mt-8">
        <CardBody className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold">{sub.planName}</p>
              <p className="text-xs text-muted">
                {durationLabel(sub.duration)} ·{" "}
                {sub.mealSlots.map(slotLabel).join(", ")}
              </p>
            </div>
            <Badge variant="success">Active</Badge>
          </div>

          <div className="rounded-md border border-border bg-primary-light p-3 text-center">
            <p className="text-xs text-muted">Your first delivery</p>
            <p className="text-lg font-bold text-primary">
              {longDate(sub.startDate)}
            </p>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Paid now</span>
            <span className="font-bold">{inr(sub.totalPriceInr)}</span>
          </div>
          <p className="text-xs text-muted">
            {billingSentence(sub.duration, sub.totalPriceInr)}
          </p>
        </CardBody>
      </Card>

      <div className="mt-6 space-y-2">
        <Link href="/dashboard">
          <Button fullWidth size="lg">
            Go to my dashboard
          </Button>
        </Link>
        <Link href="/menu">
          <Button fullWidth variant="ghost">
            Browse this week&apos;s menu
          </Button>
        </Link>
      </div>
    </div>
  );
}
