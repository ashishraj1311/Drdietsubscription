"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, CardBody, PageLoader } from "@/components/ui";
import { useBuilder } from "@/lib/providers";
import { getCoupon } from "@/lib/mock/catalog";
import { billingSentence, computePrice } from "@/lib/pricing";
import {
  dietLabel,
  durationLabel,
  goalLabel,
  inr,
  longDate,
  slotLabel,
} from "@/lib/format";

export default function OrderReviewPage() {
  const router = useRouter();
  const { plan, checkout, hydrated } = useBuilder();

  useEffect(() => {
    if (hydrated && (!plan.duration || !checkout.delivery.slot)) {
      router.replace("/checkout");
    }
  }, [hydrated, plan.duration, checkout.delivery.slot, router]);

  const mealCount = plan.duration === "trial" ? 3 : plan.mealSlots.length || 1;
  const coupon = checkout.couponCode ? getCoupon(checkout.couponCode) : null;
  const price = useMemo(
    () => computePrice(plan.duration ?? "weekly", mealCount, coupon),
    [plan.duration, mealCount, coupon],
  );

  if (!hydrated || !plan.duration) {
    return <PageLoader />;
  }

  const addr =
    checkout.addressMode === "same"
      ? checkout.address
      : Object.values(checkout.perSlotAddresses)[0] ?? null;

  const lines: { label: string; value: string; strong?: boolean; accent?: boolean }[] =
    [
      { label: "Subtotal", value: inr(price.subtotalInr + 0) },
    ];
  if (price.discountInr > 0)
    lines.push({ label: "Discount", value: "− " + inr(price.discountInr), accent: true });
  lines.push({ label: `GST (5%)`, value: inr(price.gstInr) });
  lines.push({
    label: "Delivery fee",
    value: price.deliveryFeeInr === 0 ? "Free" : inr(price.deliveryFeeInr),
  });

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-6 pb-28">
      <h1 className="text-2xl font-bold">Review your order</h1>
      <p className="mt-1 text-sm text-muted">
        Check everything below — you&apos;ll confirm payment next.
      </p>

      {/* Plan recap */}
      <Card className="mt-4">
        <CardBody>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="accent">{dietLabel(plan.diet ?? "veg")}</Badge>
            <Badge variant="surface">{goalLabel(plan.goal ?? "maintain")}</Badge>
            <Badge variant="neutral">{durationLabel(plan.duration)}</Badge>
          </div>
          <p className="mt-3 text-sm text-primary">
            {mealCount} meal{mealCount === 1 ? "" : "s"}/day
            {plan.mealSlots.length > 0 &&
              ` — ${plan.mealSlots.map(slotLabel).join(", ")}`}{" "}
            · {price.days} billing day{price.days === 1 ? "" : "s"}
          </p>
        </CardBody>
      </Card>

      {/* Delivery recap */}
      <Card className="mt-4">
        <CardBody className="space-y-1.5 text-sm">
          <Recap label="Deliver to" value={checkout.contact.name} />
          {addr && (
            <Recap
              label="Address"
              value={`${addr.line1}, ${addr.area}, ${addr.city} ${addr.pincode}`}
            />
          )}
          <Recap label="Slot" value={checkout.delivery.slot} />
          <Recap label="Starts" value={longDate(checkout.delivery.startDate)} />
          {(checkout.delivery.instructionPresets.length > 0 ||
            checkout.delivery.instructionFreetext) && (
            <Recap
              label="Instructions"
              value={[
                ...checkout.delivery.instructionPresets,
                checkout.delivery.instructionFreetext,
              ]
                .filter(Boolean)
                .join(" · ")}
            />
          )}
        </CardBody>
      </Card>

      {/* Price breakdown */}
      <Card className="mt-4">
        <CardBody>
          <div className="space-y-2">
            {lines.map((l) => (
              <div key={l.label} className="flex justify-between text-sm">
                <span className="text-muted">{l.label}</span>
                <span className={l.accent ? "font-semibold text-success" : "text-primary"}>
                  {l.value}
                </span>
              </div>
            ))}
            <div className="flex justify-between border-t border-border pt-2">
              <span className="text-base font-bold">Total</span>
              <span className="text-xl font-bold">{inr(price.totalInr)}</span>
            </div>
          </div>

          {/* Explicit billing cadence — answers "will this deduct every month?" */}
          <div className="mt-3 rounded-md border border-border bg-primary-light p-3 text-sm text-primary">
            {billingSentence(plan.duration, price.totalInr)}
          </div>
          {coupon?.discount_type === "cashback_inr" && (
            <p className="mt-2 text-xs text-muted">
              Cashback of {inr(coupon.value)} will be credited for your next renewal.
            </p>
          )}
        </CardBody>
      </Card>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-surface shadow-[var(--shadow-bar)]">
        <div className="mx-auto flex w-full max-w-lg items-center gap-3 px-4 py-3">
          <Button variant="ghost" onClick={() => router.push("/checkout")}>
            ← Edit
          </Button>
          <div className="flex-1" />
          <Button size="lg" onClick={() => router.push("/payment")}>
            Proceed to payment
          </Button>
        </div>
      </div>
    </main>
  );
}

function Recap({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="shrink-0 text-muted">{label}</span>
      <span className="text-right font-medium text-primary">{value}</span>
    </div>
  );
}
