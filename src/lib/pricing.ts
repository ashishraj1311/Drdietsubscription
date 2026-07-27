// Pricing engine — all figures in INR. Single source of truth for money math so
// the wizard, checkout and order-review screens never disagree.
import type {
  BillingCadence,
  Coupon,
  DurationType,
  PriceBreakdown,
} from "@/lib/types";

export const PER_MEAL_INR = 180;
export const GST_RATE = 0.05; // 5% GST on prepared food

// Billable days per duration (we don't deliver Sundays, hence 6/week).
export const DURATION_DAYS: Record<DurationType, number> = {
  trial: 1,
  weekly: 6,
  monthly: 26,
  quarterly: 78,
};

// Volume discount by commitment length.
const DURATION_DISCOUNT: Record<DurationType, number> = {
  trial: 0,
  weekly: 0,
  monthly: 0.1,
  quarterly: 0.18,
};

const DELIVERY_FEE: Record<DurationType, number> = {
  trial: 0,
  weekly: 49,
  monthly: 0,
  quarterly: 0,
};

export const BILLING_CADENCE: Record<DurationType, BillingCadence> = {
  trial: "one_time",
  weekly: "auto_renew",
  monthly: "auto_renew",
  quarterly: "auto_renew",
};

export function perDayInr(mealCount: number): number {
  return mealCount * PER_MEAL_INR;
}

/** Full price breakdown for a duration + meal count, with optional coupon. */
export function computePrice(
  duration: DurationType,
  mealCount: number,
  coupon?: Coupon | null,
): PriceBreakdown {
  const days = DURATION_DAYS[duration];
  const gross = perDayInr(mealCount) * days;
  const volumeDiscount = Math.round(gross * DURATION_DISCOUNT[duration]);
  const subtotal = gross - volumeDiscount;

  let couponDiscount = 0;
  if (coupon && (!coupon.min_order_inr || subtotal >= coupon.min_order_inr)) {
    if (coupon.discount_type === "flat_inr") couponDiscount = coupon.value;
    else if (coupon.discount_type === "percent")
      couponDiscount = Math.round((subtotal * coupon.value) / 100);
    // cashback_inr is credited later, not deducted now
  }
  couponDiscount = Math.min(couponDiscount, subtotal);

  const discountedSubtotal = subtotal - couponDiscount;
  const gst = Math.round(discountedSubtotal * GST_RATE);
  const deliveryFee = DELIVERY_FEE[duration];
  const total = discountedSubtotal + gst + deliveryFee;

  return {
    subtotalInr: subtotal,
    gstInr: gst,
    deliveryFeeInr: deliveryFee,
    discountInr: volumeDiscount + couponDiscount,
    totalInr: total,
    perDayInr: perDayInr(mealCount),
    days,
    billingCadence: BILLING_CADENCE[duration],
  };
}

/** Plain-language billing sentence for the order-review screen. */
export function billingSentence(
  duration: DurationType,
  totalInr: number,
): string {
  const cadence = BILLING_CADENCE[duration];
  const amount = "₹" + Math.round(totalInr).toLocaleString("en-IN");
  if (cadence === "one_time") {
    return `Billed ${amount} now. One-time — this does not auto-renew.`;
  }
  const period =
    duration === "weekly" ? "week" : duration === "monthly" ? "month" : "quarter";
  return `Billed ${amount} now. Auto-renews every ${period} — cancel anytime from your dashboard.`;
}
