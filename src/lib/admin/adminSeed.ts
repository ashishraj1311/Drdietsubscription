// Seed dataset for the mock admin console (~25 customers with full history).
// Deterministic: derived from index so the demo data is stable.
import {
  ALLERGENS,
  COUPONS,
  DELIVERY_SLOTS,
  MEALS,
  PLANS,
  REVIEWS,
  SERVICEABLE_PINCODE_PREFIXES,
} from "@/lib/mock/seed";
import {
  BILLING_CADENCE,
  GST_RATE,
  PER_MEAL_INR,
  computePrice,
} from "@/lib/pricing";
import type {
  DietPreference,
  DurationType,
  Goal,
  Invoice,
  MealSlot,
  Order,
  OrderStatus,
  PaymentMethod,
  Subscription,
} from "@/lib/types";
import type {
  AdminCustomer,
  AdminDb,
  AdminPayment,
  AdminReview,
  AdminUser,
  SupportTicket,
} from "./types";

const ADMINS: AdminUser[] = [
  { id: "adm-1", name: "Priya Nair", email: "admin@drdiet.in", password: "admin123", role: "super_admin", active: true },
  { id: "adm-2", name: "Rohit Kulkarni", email: "ops@drdiet.in", password: "ops123", role: "ops", active: true },
  { id: "adm-3", name: "Aisha Khan", email: "support@drdiet.in", password: "support123", role: "support", active: true },
];

const NAMES = [
  "Raj Mehta", "Ananya Iyer", "Vikram Singh", "Sneha Reddy", "Arjun Nair",
  "Pooja Sharma", "Karan Malhotra", "Divya Menon", "Rahul Verma", "Nisha Rao",
  "Aditya Bose", "Meera Pillai", "Sameer Khan", "Tanvi Desai", "Harsh Patel",
  "Ritika Jain", "Manish Gupta", "Kavya Krishnan", "Yash Agarwal", "Isha Kapoor",
  "Nikhil Joshi", "Shruti Deshmukh", "Aman Sinha", "Neha Chopra", "Varun Pillai",
];

const CITY_AREA: [string, string, string][] = [
  ["Mumbai", "Andheri", "400053"],
  ["Mumbai", "Bandra", "400050"],
  ["Mumbai", "Powai", "400076"],
  ["Pune", "Baner", "411045"],
  ["Pune", "Koregaon Park", "411001"],
  ["Bengaluru", "Indiranagar", "560038"],
  ["Bengaluru", "Koramangala", "560034"],
];

const DIETS: DietPreference[] = ["veg", "non_veg", "vegan", "eggetarian"];
const GOALS: Goal[] = ["lose_weight", "gain_muscle", "maintain", "eat_healthier"];
const DURATIONS: DurationType[] = ["trial", "weekly", "monthly", "quarterly"];
const SLOT_SETS: MealSlot[][] = [
  ["lunch", "dinner"],
  ["breakfast", "lunch", "dinner"],
  ["lunch"],
  ["breakfast", "lunch", "evening_snack", "dinner"],
  ["lunch", "evening_snack", "dinner"],
];
const METHODS: PaymentMethod[] = ["upi", "card", "netbanking", "wallet"];

const uid = (p: string, i: number | string) => `${p}-${i}`;
const daysAgo = (n: number) => {
  const d = new Date();
  d.setHours(9, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d.toISOString();
};
const daysFromNow = (n: number) => daysAgo(-n);

function mealFor(slot: MealSlot, diet: DietPreference): string {
  const m =
    MEALS.find((x) => x.slot === slot && x.diet_types.includes(diet)) ??
    MEALS.find((x) => x.slot === slot);
  return m?.name ?? "Chef's choice";
}

function planFor(diet: DietPreference, goal: Goal) {
  return (
    PLANS.find((p) => p.diet_type === diet && p.goal === goal) ??
    PLANS.find((p) => p.diet_type === diet) ??
    PLANS[0]
  );
}

export function buildAdminDb(): AdminDb {
  const customers: AdminCustomer[] = [];
  const subscriptions: Subscription[] = [];
  const orders: Order[] = [];
  const invoices: Invoice[] = [];
  const payments: AdminPayment[] = [];

  NAMES.forEach((name, i) => {
    const diet = DIETS[i % DIETS.length];
    const goal = GOALS[(i + 1) % GOALS.length];
    const duration = DURATIONS[i % DURATIONS.length];
    const slots = SLOT_SETS[i % SLOT_SETS.length];
    const [city] = CITY_AREA[i % CITY_AREA.length];
    const plan = planFor(diet, goal);
    // status: mostly active, every 5th paused, every 7th cancelled
    const status: Subscription["status"] =
      i % 7 === 6 ? "cancelled" : i % 5 === 4 ? "paused" : "active";
    const custStatus: AdminCustomer["status"] = i % 11 === 10 ? "suspended" : "active";
    const createdAt = daysAgo(150 - i * 5);
    const firstName = name.split(" ")[0].toLowerCase();
    const cid = uid("cus", i + 1);

    const mealCount = duration === "trial" ? 3 : slots.length;
    const price = computePrice(duration, mealCount, null);

    customers.push({
      id: cid,
      name,
      email: `${firstName}${i}@example.com`,
      phone: `98${String(76500000 + i * 137).slice(0, 8)}`,
      phoneVerified: i % 4 !== 0,
      emailVerified: i % 3 !== 0,
      city,
      createdAt,
      status: custStatus,
      goal,
      diet,
      allergyIds: i % 3 === 0 ? [ALLERGENS[i % ALLERGENS.length].id] : [],
    });

    const sub: Subscription = {
      id: uid("sub", i + 1),
      userId: cid,
      planName: plan.name,
      diet,
      goal,
      mealSlots: slots,
      duration,
      caloriesPerDay: plan.calories_per_day,
      startDate: daysAgo(150 - i * 5 - 1),
      status,
      pricePerDayInr: price.perDayInr,
      totalPriceInr: price.totalInr,
      billingCadence: BILLING_CADENCE[duration],
      createdAt,
    };
    subscriptions.push(sub);

    // orders across a window around "today"
    if (status !== "cancelled") {
      for (let d = -3; d <= 4; d++) {
        if (new Date(daysFromNow(d)).getDay() === 0) continue; // skip Sundays
        for (const slot of slots) {
          let oStatus: OrderStatus =
            d < 0 ? "delivered" : status === "paused" ? "paused" : "upcoming";
          if (d < 0 && (i + d) % 6 === 0) oStatus = "skipped";
          orders.push({
            id: uid("ord", `${i + 1}-${d}-${slot}`),
            subscriptionId: sub.id,
            deliveryDate: daysFromNow(d),
            mealSlot: slot,
            mealName: mealFor(slot, diet),
            status: oStatus,
          });
        }
      }
    } else {
      // cancelled: a couple of past delivered orders
      for (let d = -5; d <= -3; d++) {
        orders.push({
          id: uid("ord", `${i + 1}-${d}`),
          subscriptionId: sub.id,
          deliveryDate: daysFromNow(d),
          mealSlot: slots[0],
          mealName: mealFor(slots[0], diet),
          status: "delivered",
        });
      }
    }

    // payment + invoice
    const gst = Math.round((price.totalInr / (1 + GST_RATE)) * GST_RATE);
    payments.push({
      id: uid("pay", i + 1),
      customerId: cid,
      subscriptionId: sub.id,
      method: METHODS[i % METHODS.length],
      amountInr: price.totalInr,
      status: i % 9 === 8 ? "failed" : status === "cancelled" ? "refunded" : "success",
      date: createdAt,
    });
    invoices.push({
      id: uid("inv", i + 1),
      subscriptionId: sub.id,
      amountInr: price.totalInr,
      gstInr: gst,
      date: createdAt,
    });
  });

  const reviews: AdminReview[] = REVIEWS.map((r, i) => ({
    id: r.id,
    planId: r.plan_id,
    userName: r.user_name,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
    approved: i % 4 !== 3, // a few pending
  }));

  const ticketSeeds: [number, string, string, "open" | "resolved"][] = [
    [0, "Delivery was late today", "My lunch arrived after 3 PM, well past the slot.", "open"],
    [3, "Change my delivery address", "I'm moving to Baner next week, how do I update?", "open"],
    [5, "Pause my plan for a week", "Traveling for work, can I pause 5–12th?", "resolved"],
    [8, "Allergy not flagged", "I'm allergic to nuts but got a dish with peanuts.", "open"],
    [12, "Billing question", "Was I charged for the paused days?", "resolved"],
    [17, "Loved the trial!", "How do I upgrade to a monthly plan?", "open"],
  ];
  const tickets: SupportTicket[] = ticketSeeds.map(([ci, subject, msg, st], i) => ({
    id: uid("tkt", i + 1),
    customerId: uid("cus", ci + 1),
    customerName: NAMES[ci],
    subject,
    status: st,
    createdAt: daysAgo(i * 2 + 1),
    messages: [
      { from: "customer", author: NAMES[ci], message: msg, at: daysAgo(i * 2 + 1) },
      ...(st === "resolved"
        ? [{ from: "admin" as const, author: "Aisha Khan", message: "Sorted — thanks for your patience!", at: daysAgo(i * 2) }]
        : []),
    ],
  }));

  return {
    admins: ADMINS,
    customers,
    subscriptions,
    orders,
    invoices,
    payments,
    meals: structuredClone(MEALS),
    plans: structuredClone(PLANS),
    coupons: structuredClone(COUPONS),
    reviews,
    tickets,
    settings: {
      perMealInr: PER_MEAL_INR,
      gstRate: GST_RATE,
      deliveryFee: { trial: 0, weekly: 49, monthly: 0, quarterly: 0 },
      serviceablePincodePrefixes: [...SERVICEABLE_PINCODE_PREFIXES],
      deliverySlots: [...DELIVERY_SLOTS],
      businessName: "Dr Diet",
      fssaiLicense: "FSSAI-11522998000123 (placeholder)",
    },
  };
}
