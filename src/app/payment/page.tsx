"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, CardBody, Input, Logo } from "@/components/ui";
import { useAuth, useBuilder } from "@/lib/providers";
import { api } from "@/lib/mock/api";
import { COUPONS } from "@/lib/mock/seed";
import { computePrice, billingSentence } from "@/lib/pricing";
import { inr } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { PaymentMethod } from "@/lib/types";

const METHODS: { id: PaymentMethod; label: string; sub: string; emoji: string }[] = [
  { id: "upi", label: "UPI", sub: "GPay, PhonePe, Paytm & more", emoji: "📲" },
  { id: "card", label: "Card", sub: "Credit or debit", emoji: "💳" },
  { id: "netbanking", label: "Netbanking", sub: "All major banks", emoji: "🏦" },
  { id: "wallet", label: "Wallet", sub: "Paytm, Mobikwik", emoji: "👛" },
];

type Phase = "method" | "processing" | "failure";

export default function PaymentPage() {
  const router = useRouter();
  const { user, isLoggedIn, hydrated: authReady } = useAuth();
  const { plan, checkout, hydrated: builderReady } = useBuilder();

  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [upiId, setUpiId] = useState("");
  const [forceFail, setForceFail] = useState(false);
  const [phase, setPhase] = useState<Phase>("method");

  useEffect(() => {
    if (!builderReady || !authReady) return;
    if (!plan.duration || !checkout.delivery.slot) {
      router.replace("/checkout");
      return;
    }
    if (!isLoggedIn) router.replace("/auth?redirect=/checkout");
  }, [builderReady, authReady, plan.duration, checkout.delivery.slot, isLoggedIn, router]);

  const mealCount = plan.duration === "trial" ? 3 : plan.mealSlots.length || 1;
  const coupon = checkout.couponCode
    ? COUPONS.find((c) => c.code === checkout.couponCode) ?? null
    : null;
  const price = useMemo(
    () => computePrice(plan.duration ?? "weekly", mealCount, coupon),
    [plan.duration, mealCount, coupon],
  );

  async function pay() {
    setPhase("processing");
    await new Promise((r) => setTimeout(r, 1900));
    if (forceFail) {
      setPhase("failure");
      return;
    }
    // success → persist the subscription, then confirmation.
    // NOTE: don't reset the builder here — clearing plan.duration would trip the
    // page guards and bounce us to /build mid-navigation. The confirmation page
    // resets the builder after it has read the persisted subscription.
    if (user) {
      await api.createSubscription(user, plan, checkout);
    }
    router.replace("/confirmation");
  }

  if (!builderReady || !authReady || !plan.duration) {
    return <div className="p-10 text-center text-sm text-muted">Loading…</div>;
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-lg items-center justify-between px-4">
          <Logo variant="symbol" symbolClassName="h-7 w-auto" />
          <span className="text-sm font-semibold text-primary">Payment</span>
          <span className="text-sm font-bold">{inr(price.totalInr)}</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        {phase === "processing" && <Processing amount={price.totalInr} />}

        {phase === "failure" && (
          <Failure
            onRetry={() => setPhase("method")}
            amount={price.totalInr}
          />
        )}

        {phase === "method" && (
          <>
            <h1 className="text-2xl font-bold">Choose payment method</h1>
            <p className="mt-1 text-sm text-muted">
              UPI is fastest for India. All amounts in ₹.
            </p>

            <div className="mt-4 space-y-2">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  aria-pressed={method === m.id}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors",
                    method === m.id
                      ? "border-primary bg-primary-light ring-2 ring-accent"
                      : "border-border bg-surface hover:border-neutral",
                  )}
                >
                  <span className="text-2xl" aria-hidden>
                    {m.emoji}
                  </span>
                  <span className="flex-1">
                    <span className="block font-bold text-primary">{m.label}</span>
                    <span className="block text-xs text-muted">{m.sub}</span>
                  </span>
                  {method === m.id && <span className="text-primary">✓</span>}
                </button>
              ))}
            </div>

            {/* Method-specific input (UPI id only — no sensitive card capture in this demo) */}
            <Card className="mt-4">
              <CardBody>
                {method === "upi" ? (
                  <Input
                    label="UPI ID"
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    hint="You'll approve the request in your UPI app."
                  />
                ) : (
                  <p className="text-sm text-muted">
                    You&apos;ll be securely redirected to complete the{" "}
                    {METHODS.find((m) => m.id === method)?.label} payment. (Demo —
                    no real charge.)
                  </p>
                )}
              </CardBody>
            </Card>

            <div className="mt-3 rounded-md border border-border bg-primary-light p-3 text-sm text-primary">
              {billingSentence(plan.duration, price.totalInr)}
            </div>

            <label className="mt-3 flex items-center gap-2 text-xs text-muted">
              <input
                type="checkbox"
                checked={forceFail}
                onChange={(e) => setForceFail(e.target.checked)}
              />
              Simulate a failed payment (demo)
            </label>

            <Button
              fullWidth
              size="lg"
              className="mt-4"
              disabled={method === "upi" && upiId.trim().length < 3}
              onClick={pay}
            >
              Pay {inr(price.totalInr)}
            </Button>
            <Link
              href="/checkout/review"
              className="mt-3 block text-center text-sm text-muted hover:text-primary"
            >
              ← Back to review
            </Link>
          </>
        )}
      </main>
    </div>
  );
}

function Processing({ amount }: { amount: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral/30 border-t-primary" />
      <p className="mt-6 text-lg font-bold">Processing {inr(amount)}…</p>
      <p className="mt-1 text-sm text-muted">
        Please don&apos;t close this screen or press back.
      </p>
    </div>
  );
}

function Failure({ onRetry, amount }: { onRetry: () => void; amount: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/15 text-3xl">
        ⚠️
      </div>
      <h1 className="mt-5 text-2xl font-bold">Payment failed</h1>
      <p className="mt-1 max-w-xs text-sm text-muted">
        We couldn&apos;t process {inr(amount)}. No money was deducted — please try
        again or use a different method.
      </p>
      <div className="mt-6 w-full max-w-xs space-y-2">
        <Button fullWidth onClick={onRetry}>
          Retry payment
        </Button>
        <Link href="/checkout/review">
          <Button fullWidth variant="outline">
            Back to order review
          </Button>
        </Link>
      </div>
    </div>
  );
}
