// Supabase implementation of the DrDietApi seam. Activated automatically when
// NEXT_PUBLIC_SUPABASE_URL + ANON_KEY are set (see src/lib/mock/api.ts selector).
//
// Phase 1 scope: real auth (phone OTP, Google OAuth, anonymous guest) + real
// persistence for the profile, subscriptions, orders and invoices — i.e. the
// full "user buys a subscription" path. Catalog reads still come from the seed
// on the storefront; the admin console and payment gateway are later phases.
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/client";
import { SERVICEABLE_PINCODE_PREFIXES } from "@/lib/mock/seed";
import { computePrice, BILLING_CADENCE } from "@/lib/pricing";
import type { DrDietApi } from "@/lib/mock/api";
import type {
  CheckoutState,
  DietPreference,
  Goal,
  Invoice,
  MealSlot,
  Order,
  PlanBuilderState,
  Subscription,
  User,
} from "@/lib/types";

function db(): SupabaseClient {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured.");
  return client;
}

// ---- row shapes (snake_case, as stored) -----------------------------------
interface ProfileRow {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  auth_provider: User["auth_provider"];
  phone_verified: boolean;
  email_verified: boolean;
  created_at: string;
  goal: Goal | null;
  diet_preference: DietPreference | null;
  height_cm: number | null;
  weight_kg: number | null;
  age: number | null;
  gender: User["gender"] | null;
}

interface SubRow {
  id: string;
  user_id: string;
  plan_name: string;
  diet: DietPreference;
  goal: Goal;
  meal_slots: MealSlot[];
  duration: Subscription["duration"];
  calories_per_day: number;
  start_date: string;
  status: Subscription["status"];
  price_per_day_inr: number;
  total_price_inr: number;
  billing_cadence: Subscription["billingCadence"];
  created_at: string;
}

interface OrderRow {
  id: string;
  subscription_id: string;
  delivery_date: string;
  meal_slot: MealSlot;
  meal_name: string;
  status: Order["status"];
}

interface InvoiceRow {
  id: string;
  subscription_id: string;
  amount_inr: number;
  gst_inr: number;
  date: string;
}

// ---- row <-> domain mappers ------------------------------------------------
function toUser(r: ProfileRow): User {
  return {
    id: r.id,
    name: r.name ?? "",
    email: r.email,
    phone: r.phone,
    auth_provider: r.auth_provider,
    phone_verified: r.phone_verified,
    email_verified: r.email_verified,
    created_at: r.created_at,
    goal: r.goal ?? undefined,
    diet_preference: r.diet_preference ?? undefined,
    height_cm: r.height_cm,
    weight_kg: r.weight_kg,
    age: r.age,
    gender: r.gender ?? null,
  };
}

function toSubscription(r: SubRow): Subscription {
  return {
    id: r.id,
    userId: r.user_id,
    planName: r.plan_name,
    diet: r.diet,
    goal: r.goal,
    mealSlots: r.meal_slots ?? [],
    duration: r.duration,
    caloriesPerDay: r.calories_per_day,
    startDate: r.start_date,
    status: r.status,
    pricePerDayInr: r.price_per_day_inr,
    totalPriceInr: r.total_price_inr,
    billingCadence: r.billing_cadence,
    createdAt: r.created_at,
  };
}

function toOrder(r: OrderRow): Order {
  return {
    id: r.id,
    subscriptionId: r.subscription_id,
    deliveryDate: r.delivery_date,
    mealSlot: r.meal_slot,
    mealName: r.meal_name,
    status: r.status,
  };
}

function toInvoice(r: InvoiceRow): Invoice {
  return {
    id: r.id,
    subscriptionId: r.subscription_id,
    amountInr: r.amount_inr,
    gstInr: r.gst_inr,
    date: r.date,
  };
}

// ---- small pure helpers (shared shape with the mock) -----------------------
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

function dietPlanName(diet: DietPreference, goal: Goal | null): string {
  const dietWord =
    diet === "veg" ? "Veg" : diet === "non_veg" ? "Non-Veg" : diet === "vegan" ? "Vegan" : "Eggetarian";
  const goalWord =
    goal === "lose_weight" ? "Lean" : goal === "gain_muscle" ? "Muscle" : goal === "eat_healthier" ? "Wellness" : "Balance";
  return `${dietWord} ${goalWord} Plan`;
}

function estimateCaloriesFallback(goal: Goal | null): number {
  return goal === "lose_weight" ? 1500 : goal === "gain_muscle" ? 2400 : goal === "eat_healthier" ? 1700 : 1900;
}

async function currentProfile(): Promise<User | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data: sessionData } = await client.auth.getUser();
  const authUser = sessionData.user;
  if (!authUser) return null;
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .maybeSingle();
  if (error || !data) return null;
  return toUser(data as ProfileRow);
}

// Pick a meal name for a slot + diet from the catalog table.
async function mealForSlotDiet(slot: MealSlot, diet: DietPreference): Promise<string> {
  const client = db();
  const { data } = await client
    .from("meals")
    .select("name")
    .eq("slot", slot)
    .contains("diet_types", [diet])
    .limit(1);
  if (data && data.length) return (data[0] as { name: string }).name;
  const { data: anySlot } = await client.from("meals").select("name").eq("slot", slot).limit(1);
  if (anySlot && anySlot.length) return (anySlot[0] as { name: string }).name;
  return "Chef's choice";
}

export const supabaseApi: DrDietApi = {
  // -------- auth --------
  async requestOtp(phone) {
    const { error } = await db().auth.signInWithOtp({ phone });
    if (error) throw new Error(error.message);
    return { devCode: "" }; // real SMS — no code to surface in the UI
  },

  async verifyOtp(phone, code) {
    const client = db();
    const { error } = await client.auth.verifyOtp({ phone, token: code, type: "sms" });
    if (error) throw new Error("That code doesn't match. Please try again.");
    await client.from("profiles").update({ phone, phone_verified: true }).eq("phone", phone);
    const user = await currentProfile();
    if (!user) throw new Error("Could not load your profile after sign-in.");
    return user;
  },

  async requestEmailOtp(email) {
    const { error } = await db().auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) throw new Error(error.message);
    return { devCode: "" }; // real email — the code arrives in the inbox
  },

  async verifyEmailOtp(email, code) {
    const client = db();
    const { error } = await client.auth.verifyOtp({ email, token: code, type: "email" });
    if (error) throw new Error("That code doesn't match. Please try again.");
    const { data: sessionData } = await client.auth.getUser();
    if (sessionData.user) {
      await client
        .from("profiles")
        .update({ email, email_verified: true })
        .eq("id", sessionData.user.id);
    }
    const user = await currentProfile();
    if (!user) throw new Error("Could not load your profile after sign-in.");
    return user;
  },

  async googleSignIn() {
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth` : undefined;
    const { error } = await db().auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
    if (error) throw new Error(error.message);
    // The browser is now redirecting to Google; this promise never resolves.
    // On return, detectSessionInUrl completes the session and subscribeAuth fires.
    return new Promise<User>(() => {});
  },

  async continueAsGuest() {
    const client = db();
    const { error } = await client.auth.signInAnonymously();
    if (error) throw new Error(error.message);
    await client.auth.updateUser({ data: { name: "Guest" } });
    const { data: sessionData } = await client.auth.getUser();
    if (sessionData.user) {
      await client
        .from("profiles")
        .update({ name: "Guest", auth_provider: "guest" })
        .eq("id", sessionData.user.id);
    }
    const user = await currentProfile();
    if (!user) throw new Error("Could not start a guest session.");
    return user;
  },

  async getUser() {
    return currentProfile();
  },

  async saveUser(user) {
    const client = getSupabaseClient();
    if (!client) return;
    await client
      .from("profiles")
      .update({
        name: user.name,
        email: user.email,
        phone: user.phone,
        goal: user.goal ?? null,
        diet_preference: user.diet_preference ?? null,
        height_cm: user.height_cm ?? null,
        weight_kg: user.weight_kg ?? null,
        age: user.age ?? null,
        gender: user.gender ?? null,
      })
      .eq("id", user.id);
  },

  async signOut() {
    const client = getSupabaseClient();
    if (client) await client.auth.signOut();
  },

  subscribeAuth(cb) {
    const client = getSupabaseClient();
    if (!client) return () => {};
    const { data } = client.auth.onAuthStateChange(async () => {
      cb(await currentProfile());
    });
    return () => data.subscription.unsubscribe();
  },

  // -------- serviceability + coupons --------
  async checkServiceability(pincode) {
    const clean = pincode.replace(/\D/g, "");
    if (clean.length !== 6) return false;
    return SERVICEABLE_PINCODE_PREFIXES.includes(clean.slice(0, 3));
  },

  async validateCoupon(code, subtotalInr, isFirstTime) {
    const { data } = await db()
      .from("coupons")
      .select("*")
      .ilike("code", code.trim())
      .maybeSingle();
    if (!data) return { ok: false, reason: "Invalid coupon code." };
    const coupon = {
      code: data.code,
      label: data.label,
      discount_type: data.discount_type,
      value: data.value,
      is_first_time_buyer_only: data.is_first_time_buyer_only,
      min_order_inr: data.min_order_inr ?? undefined,
    };
    if (coupon.is_first_time_buyer_only && !isFirstTime)
      return { ok: false, reason: "This offer is for first-time orders only." };
    if (coupon.min_order_inr && subtotalInr < coupon.min_order_inr)
      return {
        ok: false,
        reason: `Add ₹${(coupon.min_order_inr - subtotalInr).toLocaleString("en-IN")} more to use this coupon.`,
      };
    return { ok: true, coupon };
  },

  // -------- subscription lifecycle --------
  async createSubscription(user, plan: PlanBuilderState, checkout: CheckoutState) {
    const client = db();
    const mealCount = plan.mealSlots.length || 1;

    let coupon = null;
    if (checkout.couponCode) {
      const { data } = await client.from("coupons").select("*").ilike("code", checkout.couponCode.trim()).maybeSingle();
      if (data)
        coupon = {
          code: data.code,
          label: data.label,
          discount_type: data.discount_type,
          value: data.value,
          is_first_time_buyer_only: data.is_first_time_buyer_only,
          min_order_inr: data.min_order_inr ?? undefined,
        };
    }

    const price = computePrice(plan.duration ?? "weekly", mealCount, coupon);
    const diet = plan.diet ?? "veg";

    // Resolve plan name + calories (query the catalog when anchored to a plan).
    let planName = dietPlanName(diet, plan.goal);
    let calories = estimateCaloriesFallback(plan.goal);
    if (plan.planId) {
      const { data: p } = await client
        .from("plans")
        .select("name, calories_per_day")
        .eq("id", plan.planId)
        .maybeSingle();
      if (p) {
        planName = (p as { name: string }).name;
        calories = (p as { calories_per_day: number }).calories_per_day;
      }
    }

    // Single active plan per user (mirror the mock): cancel prior active subs.
    await client.from("subscriptions").update({ status: "cancelled" }).eq("user_id", user.id).eq("status", "active");

    const { data: subRow, error: subErr } = await client
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan_name: planName,
        diet,
        goal: plan.goal ?? "maintain",
        meal_slots: plan.mealSlots,
        duration: plan.duration ?? "weekly",
        calories_per_day: calories,
        start_date: checkout.delivery.startDate,
        status: "active",
        price_per_day_inr: price.perDayInr,
        total_price_inr: price.totalInr,
        billing_cadence: BILLING_CADENCE[plan.duration ?? "weekly"],
      })
      .select("*")
      .single();
    if (subErr || !subRow) throw new Error(subErr?.message ?? "Could not create the subscription.");
    const subscription = toSubscription(subRow as SubRow);

    // First stretch of orders.
    const dates = deliveryDates(checkout.delivery.startDate, plan.duration === "trial" ? 1 : 7);
    const orderRows: Array<Omit<OrderRow, "id">> = [];
    for (const date of dates) {
      for (const slot of plan.mealSlots) {
        orderRows.push({
          subscription_id: subscription.id,
          delivery_date: date,
          meal_slot: slot,
          meal_name: await mealForSlotDiet(slot, diet),
          status: "upcoming",
        });
      }
    }
    if (orderRows.length) await client.from("orders").insert(orderRows);

    const { data: invRow, error: invErr } = await client
      .from("invoices")
      .insert({
        subscription_id: subscription.id,
        user_id: user.id,
        amount_inr: price.totalInr,
        gst_inr: price.gstInr,
      })
      .select("*")
      .single();
    if (invErr || !invRow) throw new Error(invErr?.message ?? "Could not create the invoice.");

    return { subscription, invoice: toInvoice(invRow as InvoiceRow) };
  },

  async getSubscriptions(userId) {
    const { data } = await db().from("subscriptions").select("*").eq("user_id", userId);
    return (data ?? []).map((r) => toSubscription(r as SubRow));
  },

  async getActiveSubscription(userId) {
    const { data } = await db()
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["active", "paused"])
      .order("created_at", { ascending: false })
      .limit(1);
    if (!data || !data.length) return null;
    return toSubscription(data[0] as SubRow);
  },

  async getOrders(subscriptionId) {
    const { data } = await db()
      .from("orders")
      .select("*")
      .eq("subscription_id", subscriptionId)
      .order("delivery_date", { ascending: true });
    return (data ?? []).map((r) => toOrder(r as OrderRow));
  },

  async getInvoices(userId) {
    const { data } = await db()
      .from("invoices")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });
    return (data ?? []).map((r) => toInvoice(r as InvoiceRow));
  },

  async setSubscriptionStatus(subId, status) {
    const client = db();
    const { data, error } = await client
      .from("subscriptions")
      .update({ status })
      .eq("id", subId)
      .select("*")
      .maybeSingle();
    if (error || !data) return null;
    // Reflect pause/resume onto upcoming orders (mirror the mock).
    if (status === "paused" || status === "active") {
      await client
        .from("orders")
        .update({ status: status === "paused" ? "paused" : "upcoming" })
        .eq("subscription_id", subId)
        .in("status", status === "paused" ? ["upcoming"] : ["paused"]);
    }
    return toSubscription(data as SubRow);
  },

  async setOrderStatus(orderId, status) {
    const { data, error } = await db()
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select("*")
      .maybeSingle();
    if (error || !data) return null;
    return toOrder(data as OrderRow);
  },
};
