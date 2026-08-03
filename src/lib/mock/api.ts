// Mock backend. Everything the UI needs that is *stateful* (auth, serviceability,
// coupons, subscriptions/orders/invoices) goes through the `DrDietApi` interface
// so a real backend (Supabase/Firebase) can replace `mockApi` without touching UI.
//
// Static catalog (plans/meals/reviews/allergens) is read directly from ./seed.
import { SERVICEABLE_PINCODE_PREFIXES } from "@/lib/mock/seed";
import { catalogStore } from "@/lib/mock/catalogStore";
import { computePrice, BILLING_CADENCE } from "@/lib/pricing";
import type {
  CheckoutState,
  Coupon,
  DietPreference,
  Goal,
  Invoice,
  MealSlot,
  Order,
  PlanBuilderState,
  Subscription,
  User,
} from "@/lib/types";

const LS = {
  user: "drdiet.user",
  subs: "drdiet.subscriptions",
  orders: "drdiet.orders",
  invoices: "drdiet.invoices",
} as const;

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

const uid = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

// pending OTP codes (in-memory; fine for a mock)
const pendingOtp = new Map<string, string>();

function mealForSlotDiet(slot: MealSlot, diet: DietPreference): string {
  const meals = catalogStore.meals();
  const match = meals.find((m) => m.slot === slot && m.diet_types.includes(diet));
  return match?.name ?? meals.find((m) => m.slot === slot)?.name ?? "Chef's choice";
}

// Next `count` delivery dates from `start`, skipping Sundays.
function deliveryDates(start: string, count: number): string[] {
  const dates: string[] = [];
  const d = new Date(start);
  while (dates.length < count) {
    if (d.getDay() !== 0) dates.push(new Date(d).toISOString());
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

export interface DrDietApi {
  // auth
  requestOtp(phone: string): Promise<{ devCode: string }>;
  verifyOtp(phone: string, code: string): Promise<User>;
  googleSignIn(): Promise<User>;
  continueAsGuest(): Promise<User>;
  getUser(): User | null;
  saveUser(user: User): void;
  signOut(): void;

  // serviceability + coupons
  checkServiceability(pincode: string): Promise<boolean>;
  validateCoupon(
    code: string,
    subtotalInr: number,
    isFirstTime: boolean,
  ): Promise<{ ok: boolean; coupon?: Coupon; reason?: string }>;

  // subscription lifecycle
  createSubscription(
    user: User,
    plan: PlanBuilderState,
    checkout: CheckoutState,
  ): Promise<{ subscription: Subscription; invoice: Invoice }>;
  getSubscriptions(userId: string): Subscription[];
  getActiveSubscription(userId: string): Subscription | null;
  getOrders(subscriptionId: string): Order[];
  getInvoices(userId: string): Invoice[];

  // dashboard actions
  setSubscriptionStatus(
    subId: string,
    status: Subscription["status"],
  ): Promise<Subscription | null>;
  setOrderStatus(orderId: string, status: Order["status"]): Promise<Order | null>;
}

export const mockApi: DrDietApi = {
  async requestOtp(phone) {
    await delay(600);
    const code = String(Math.floor(1000 + Math.random() * 9000));
    pendingOtp.set(phone, code);
    return { devCode: code }; // "sent" — surfaced in the UI for the demo
  },

  async verifyOtp(phone, code) {
    await delay(600);
    const expected = pendingOtp.get(phone);
    if (!expected || code !== expected) {
      throw new Error("That code doesn't match. Please try again.");
    }
    pendingOtp.delete(phone);
    const existing = this.getUser();
    const user: User = existing?.phone === phone
      ? { ...existing, phone_verified: true }
      : {
          id: uid("u"),
          name: "",
          email: null,
          phone,
          auth_provider: "otp",
          phone_verified: true,
          email_verified: false,
          created_at: new Date().toISOString(),
        };
    this.saveUser(user);
    return user;
  },

  async googleSignIn() {
    await delay(700);
    const user: User = {
      id: uid("u"),
      name: "Raj Mehta",
      email: "raj.mehta@gmail.com",
      phone: null,
      auth_provider: "google",
      phone_verified: false, // phone still needs its own OTP (per flow spec)
      email_verified: true,
      created_at: new Date().toISOString(),
    };
    this.saveUser(user);
    return user;
  },

  async continueAsGuest() {
    await delay(200);
    const user: User = {
      id: uid("guest"),
      name: "Guest",
      email: null,
      phone: null,
      auth_provider: "guest",
      phone_verified: false,
      email_verified: false,
      created_at: new Date().toISOString(),
    };
    this.saveUser(user);
    return user;
  },

  getUser() {
    return read<User | null>(LS.user, null);
  },

  saveUser(user) {
    write(LS.user, user);
  },

  signOut() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(LS.user);
  },

  async checkServiceability(pincode) {
    await delay(500);
    const clean = pincode.replace(/\D/g, "");
    if (clean.length !== 6) return false;
    return SERVICEABLE_PINCODE_PREFIXES.includes(clean.slice(0, 3));
  },

  async validateCoupon(code, subtotalInr, isFirstTime) {
    await delay(400);
    const coupon = catalogStore.coupon(code);
    if (!coupon) return { ok: false, reason: "Invalid coupon code." };
    if (coupon.is_first_time_buyer_only && !isFirstTime)
      return { ok: false, reason: "This offer is for first-time orders only." };
    if (coupon.min_order_inr && subtotalInr < coupon.min_order_inr)
      return {
        ok: false,
        reason: `Add ₹${(coupon.min_order_inr - subtotalInr).toLocaleString(
          "en-IN",
        )} more to use this coupon.`,
      };
    return { ok: true, coupon };
  },

  async createSubscription(user, plan, checkout) {
    await delay(400);
    const mealCount = plan.mealSlots.length || 1;
    const coupon = checkout.couponCode ? catalogStore.coupon(checkout.couponCode) : null;
    const price = computePrice(plan.duration ?? "weekly", mealCount, coupon);
    const diet = plan.diet ?? "veg";

    const subscription: Subscription = {
      id: uid("sub"),
      userId: user.id,
      planName: plan.planId ? planNameFor(plan.planId) : dietPlanName(diet, plan.goal),
      diet,
      goal: plan.goal ?? "maintain",
      mealSlots: plan.mealSlots,
      duration: plan.duration ?? "weekly",
      caloriesPerDay: estimateCalories(plan),
      startDate: checkout.delivery.startDate,
      status: "active",
      pricePerDayInr: price.perDayInr,
      totalPriceInr: price.totalInr,
      billingCadence: BILLING_CADENCE[plan.duration ?? "weekly"],
      createdAt: new Date().toISOString(),
    };

    // generate the first stretch of orders
    const dates = deliveryDates(
      checkout.delivery.startDate,
      plan.duration === "trial" ? 1 : 7,
    );
    const orders: Order[] = [];
    for (const date of dates) {
      for (const slot of plan.mealSlots) {
        orders.push({
          id: uid("ord"),
          subscriptionId: subscription.id,
          deliveryDate: date,
          mealSlot: slot,
          mealName: mealForSlotDiet(slot, diet),
          status: "upcoming",
        });
      }
    }

    const invoice: Invoice = {
      id: uid("inv"),
      subscriptionId: subscription.id,
      amountInr: price.totalInr,
      gstInr: price.gstInr,
      date: new Date().toISOString(),
    };

    const subs = read<Subscription[]>(LS.subs, []);
    // deactivate prior active subs (single active plan for the demo)
    subs.forEach((s) => {
      if (s.userId === user.id && s.status === "active") s.status = "cancelled";
    });
    write(LS.subs, [...subs, subscription]);
    write(LS.orders, [...read<Order[]>(LS.orders, []), ...orders]);
    write(LS.invoices, [...read<Invoice[]>(LS.invoices, []), invoice]);

    return { subscription, invoice };
  },

  getSubscriptions(userId) {
    return read<Subscription[]>(LS.subs, []).filter((s) => s.userId === userId);
  },

  getActiveSubscription(userId) {
    return (
      read<Subscription[]>(LS.subs, [])
        .filter((s) => s.userId === userId)
        .find((s) => s.status === "active" || s.status === "paused") ?? null
    );
  },

  getOrders(subscriptionId) {
    return read<Order[]>(LS.orders, [])
      .filter((o) => o.subscriptionId === subscriptionId)
      .sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate));
  },

  getInvoices(userId) {
    const subIds = new Set(this.getSubscriptions(userId).map((s) => s.id));
    return read<Invoice[]>(LS.invoices, []).filter((i) =>
      subIds.has(i.subscriptionId),
    );
  },

  async setSubscriptionStatus(subId, status) {
    await delay(300);
    const subs = read<Subscription[]>(LS.subs, []);
    const sub = subs.find((s) => s.id === subId);
    if (!sub) return null;
    sub.status = status;
    write(LS.subs, subs);
    // reflect pause/resume onto upcoming orders
    if (status === "paused" || status === "active") {
      const orders = read<Order[]>(LS.orders, []);
      orders.forEach((o) => {
        if (o.subscriptionId === subId && o.status !== "delivered" && o.status !== "skipped") {
          o.status = status === "paused" ? "paused" : "upcoming";
        }
      });
      write(LS.orders, orders);
    }
    return sub;
  },

  async setOrderStatus(orderId, status) {
    await delay(300);
    const orders = read<Order[]>(LS.orders, []);
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;
    order.status = status;
    write(LS.orders, orders);
    return order;
  },
};

// --- small helpers for subscription labelling ---
function planNameFor(planId: string): string {
  return catalogStore.plans().find((p) => p.id === planId)?.name ?? "Custom Plan";
}

function dietPlanName(diet: DietPreference, goal: Goal | null): string {
  const dietWord =
    diet === "veg"
      ? "Veg"
      : diet === "non_veg"
        ? "Non-Veg"
        : diet === "vegan"
          ? "Vegan"
          : "Eggetarian";
  const goalWord =
    goal === "lose_weight"
      ? "Lean"
      : goal === "gain_muscle"
        ? "Muscle"
        : goal === "eat_healthier"
          ? "Wellness"
          : "Balance";
  return `${dietWord} ${goalWord} Plan`;
}

function estimateCalories(plan: PlanBuilderState): number {
  if (plan.planId) {
    const p = catalogStore.plans().find((x) => x.id === plan.planId);
    if (p) return p.calories_per_day;
  }
  const base =
    plan.goal === "lose_weight"
      ? 1500
      : plan.goal === "gain_muscle"
        ? 2400
        : plan.goal === "eat_healthier"
          ? 1700
          : 1900;
  // scale a little by number of meals
  return base;
}

export const api = mockApi;
