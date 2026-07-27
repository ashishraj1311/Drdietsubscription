"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, CardBody, Chip, Input } from "@/components/ui";
import { useAuth, useBuilder } from "@/lib/providers";
import { AddressFields, emptyAddress } from "./AddressFields";
import {
  DELIVERY_INSTRUCTION_PRESETS,
  DELIVERY_SLOTS,
} from "@/lib/mock/seed";
import { computePrice } from "@/lib/pricing";
import { inr, longDate, slotLabel } from "@/lib/format";
import type { AddressData } from "@/lib/types";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoggedIn, hydrated: authReady } = useAuth();
  const { plan, checkout, setCheckout, hydrated: builderReady } = useBuilder();

  // Prefill contact from the authenticated user once.
  useEffect(() => {
    if (!authReady || !user) return;
    setCheckout({
      contact: {
        name: checkout.contact.name || (user.name === "Guest" ? "" : user.name),
        phone: checkout.contact.phone || user.phone || "",
        email: checkout.contact.email || user.email || "",
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, user]);

  // Guards: need a built plan and a verified (non-guest) account.
  useEffect(() => {
    if (!builderReady || !authReady) return;
    if (!plan.duration || !plan.diet) {
      router.replace("/build");
      return;
    }
    if (!isLoggedIn) {
      router.replace("/auth?redirect=/checkout");
    }
  }, [builderReady, authReady, plan.duration, plan.diet, isLoggedIn, router]);

  const mealCount = plan.duration === "trial" ? 3 : plan.mealSlots.length || 1;
  const price = useMemo(
    () => computePrice(plan.duration ?? "weekly", mealCount),
    [plan.duration, mealCount],
  );

  // local coupon UX
  const [couponInput, setCouponInput] = useState(checkout.couponCode ?? "");
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(
    checkout.couponCode ? { ok: true, text: "Coupon applied" } : null,
  );
  const [applying, setApplying] = useState(false);

  async function applyCoupon() {
    setApplying(true);
    const { api } = await import("@/lib/mock/api");
    const res = await api.validateCoupon(couponInput, price.subtotalInr, true);
    if (res.ok && res.coupon) {
      setCheckout({ couponCode: res.coupon.code });
      setCouponMsg({ ok: true, text: `Applied: ${res.coupon.label}` });
    } else {
      setCheckout({ couponCode: null });
      setCouponMsg({ ok: false, text: res.reason ?? "Invalid coupon." });
    }
    setApplying(false);
  }

  // address helpers
  const singleAddr = checkout.address ?? emptyAddress();
  const setSingle = (a: AddressData) => setCheckout({ address: a });
  const setSlotAddr = (slot: string, a: AddressData) =>
    setCheckout({
      perSlotAddresses: { ...checkout.perSlotAddresses, [slot]: a },
    });

  const addressesOk =
    checkout.addressMode === "same"
      ? !!checkout.address?.serviceable && !!checkout.address?.line1
      : plan.mealSlots.every(
          (s) =>
            checkout.perSlotAddresses[s]?.serviceable &&
            checkout.perSlotAddresses[s]?.line1,
        );

  const contactOk =
    checkout.contact.name.trim() &&
    checkout.contact.phone.replace(/\D/g, "").length === 10 &&
    /.+@.+\..+/.test(checkout.contact.email);

  const canContinue =
    !!contactOk && addressesOk && !!checkout.delivery.slot && !!checkout.delivery.startDate;

  if (!builderReady || !authReady || !plan.duration) {
    return (
      <div className="p-10 text-center text-sm text-muted">Loading checkout…</div>
    );
  }

  const startDateValue = checkout.delivery.startDate.slice(0, 10);

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-6 pb-28">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <p className="mt-1 text-sm text-muted">
        A few details and you&apos;re set. We check delivery to your area first.
      </p>

      {/* 1. Contact */}
      <Section n="1" title="Contact details">
        <div className="space-y-3">
          <Input
            label="Full name"
            placeholder="Raj Mehta"
            value={checkout.contact.name}
            onChange={(e) =>
              setCheckout({ contact: { ...checkout.contact, name: e.target.value } })
            }
          />
          <Input
            label="Mobile number"
            inputMode="numeric"
            placeholder="98765 43210"
            value={checkout.contact.phone}
            onChange={(e) =>
              setCheckout({ contact: { ...checkout.contact, phone: e.target.value } })
            }
          />
          <Input
            label="Email"
            type="email"
            placeholder="raj@example.com"
            value={checkout.contact.email}
            onChange={(e) =>
              setCheckout({ contact: { ...checkout.contact, email: e.target.value } })
            }
          />
        </div>
      </Section>

      {/* 2. Delivery address */}
      <Section n="2" title="Delivery address">
        <div className="mb-3 flex flex-wrap gap-2">
          <Chip
            selected={checkout.addressMode === "same"}
            onClick={() => setCheckout({ addressMode: "same" })}
          >
            Same address for all meals
          </Chip>
          <Chip
            selected={checkout.addressMode === "different"}
            onClick={() => setCheckout({ addressMode: "different" })}
          >
            Different per meal
          </Chip>
        </div>

        {checkout.addressMode === "same" ? (
          <AddressFields value={singleAddr} onChange={setSingle} />
        ) : (
          <div className="space-y-6">
            {plan.mealSlots.map((s) => (
              <AddressFields
                key={s}
                heading={`${slotLabel(s)} delivery`}
                value={checkout.perSlotAddresses[s] ?? emptyAddress()}
                onChange={(a) => setSlotAddr(s, a)}
              />
            ))}
          </div>
        )}
      </Section>

      {/* 3. Delivery slot */}
      <Section n="3" title="Delivery slot">
        {!addressesOk && (
          <p className="mb-2 text-xs text-muted">
            Confirm a serviceable address above to see available slots.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {DELIVERY_SLOTS.map((s) => (
            <Chip
              key={s}
              disabled={!addressesOk}
              selected={checkout.delivery.slot === s}
              onClick={() =>
                setCheckout({ delivery: { ...checkout.delivery, slot: s } })
              }
            >
              {s}
            </Chip>
          ))}
        </div>
        {addressesOk && (
          <p className="mt-2 text-xs text-muted">
            Slots shown are those available for your area.
          </p>
        )}
      </Section>

      {/* 4. Delivery instructions */}
      <Section n="4" title="Delivery instructions">
        <div className="flex flex-wrap gap-2">
          {DELIVERY_INSTRUCTION_PRESETS.map((p) => {
            const on = checkout.delivery.instructionPresets.includes(p);
            return (
              <Chip
                key={p}
                selected={on}
                onClick={() =>
                  setCheckout({
                    delivery: {
                      ...checkout.delivery,
                      instructionPresets: on
                        ? checkout.delivery.instructionPresets.filter((x) => x !== p)
                        : [...checkout.delivery.instructionPresets, p],
                    },
                  })
                }
              >
                {p}
              </Chip>
            );
          })}
        </div>
        <div className="mt-3">
          <Input
            label="Anything else? (optional)"
            placeholder="e.g. Call on arrival, gate code 4321"
            value={checkout.delivery.instructionFreetext}
            onChange={(e) =>
              setCheckout({
                delivery: { ...checkout.delivery, instructionFreetext: e.target.value },
              })
            }
          />
        </div>
      </Section>

      {/* 5. Start date */}
      <Section n="5" title="Start date">
        <Input
          type="date"
          value={startDateValue}
          min={new Date().toISOString().slice(0, 10)}
          onChange={(e) =>
            setCheckout({
              delivery: {
                ...checkout.delivery,
                startDate: new Date(e.target.value).toISOString(),
              },
            })
          }
        />
        <p className="mt-2 text-sm font-semibold text-primary">
          Your first delivery will be on {longDate(checkout.delivery.startDate)}.
        </p>
      </Section>

      {/* 6. Coupon */}
      <Section n="6" title="Have a coupon?">
        <div className="mb-2">
          <button
            onClick={() => {
              setCouponInput("WELCOME150");
              setCheckout({ couponCode: null });
              setCouponMsg(null);
            }}
            className="rounded-md border border-accent bg-accent/40 px-3 py-2 text-left text-xs text-primary hover:bg-accent/60"
          >
            🎉 First order? Tap to use <strong>WELCOME150</strong> — ₹150 off
          </button>
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              label="Coupon code"
              placeholder="WELCOME150"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
            />
          </div>
          <Button
            variant="outline"
            disabled={!couponInput.trim() || applying}
            onClick={applyCoupon}
          >
            {applying ? "…" : "Apply"}
          </Button>
        </div>
        {couponMsg && (
          <p className={`mt-2 text-xs ${couponMsg.ok ? "text-success" : "text-danger"}`}>
            {couponMsg.text}
          </p>
        )}
      </Section>

      {/* Sticky continue */}
      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-surface">
        <div className="mx-auto flex w-full max-w-lg items-center gap-3 px-4 py-3">
          <div className="flex-1">
            <p className="text-xs text-muted">Starting total</p>
            <p className="text-lg font-bold">{inr(price.totalInr)}</p>
          </div>
          <Button
            size="lg"
            disabled={!canContinue}
            onClick={() => router.push("/checkout/review")}
          >
            Review order
          </Button>
        </div>
      </div>

      {!canContinue && (
        <Badge variant="surface" className="mt-4">
          Complete contact, a serviceable address and a slot to continue.
        </Badge>
      )}
    </main>
  );
}

function Section({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="mt-4">
      <CardBody>
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-light">
            {n}
          </span>
          <h2 className="text-base font-bold">{title}</h2>
        </div>
        {children}
      </CardBody>
    </Card>
  );
}
