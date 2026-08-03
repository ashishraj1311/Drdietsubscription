// Mock admin data store — localStorage-backed, seeded once from buildAdminDb().
// All admin reads/writes go through here so a real backend can replace it later.
import { buildAdminDb } from "./adminSeed";
import { catalogStore } from "@/lib/mock/catalogStore";
import type {
  AdminCustomer,
  AdminDb,
  AdminSettings,
  AdminUser,
  Kpis,
  SupportTicket,
} from "./types";
import type {
  Coupon,
  Invoice,
  Meal,
  Order,
  PaymentMethod,
  Plan,
  Subscription,
  User,
} from "@/lib/types";

const KEY = "drdiet.admin.db";
let cache: AdminDb | null = null;

function load(): AdminDb {
  if (cache) return cache;
  if (typeof window === "undefined") return buildAdminDb();
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as AdminDb) : buildAdminDb();
  } catch {
    cache = buildAdminDb();
  }
  if (!localStorage.getItem(KEY)) persist();
  return cache!;
}

function persist() {
  if (typeof window === "undefined" || !cache) return;
  localStorage.setItem(KEY, JSON.stringify(cache));
}

function mutate<T>(fn: (db: AdminDb) => T): T {
  const db = load();
  const r = fn(db);
  persist();
  return r;
}

const sameDay = (a: string, b: Date) => {
  const d = new Date(a);
  return (
    d.getFullYear() === b.getFullYear() &&
    d.getMonth() === b.getMonth() &&
    d.getDate() === b.getDate()
  );
};

const uid = (p: string) =>
  `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

export const adminStore = {
  db: load,
  resetDemo() {
    cache = buildAdminDb();
    persist();
  },

  // ---- KPIs ----
  kpis(): Kpis {
    const db = load();
    const active = db.subscriptions.filter((s) => s.status === "active");
    const monthlyEquivalent = (s: Subscription) => {
      switch (s.duration) {
        case "weekly":
          return Math.round(s.totalPriceInr * 4.33);
        case "monthly":
          return s.totalPriceInr;
        case "quarterly":
          return Math.round(s.totalPriceInr / 3);
        default:
          return 0; // trial = one-time
      }
    };
    const now = new Date();
    const planCounts = new Map<string, number>();
    db.subscriptions.forEach((s) => {
      if (s.status !== "cancelled")
        planCounts.set(s.planName, (planCounts.get(s.planName) ?? 0) + 1);
    });
    const dietCounts = new Map<string, number>();
    db.customers.forEach((c) => dietCounts.set(c.diet, (dietCounts.get(c.diet) ?? 0) + 1));

    const revByMonth: { month: string; inr: number }[] = [];
    for (let m = 5; m >= 0; m--) {
      const dt = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const label = dt.toLocaleDateString("en-IN", { month: "short" });
      const inr = db.payments
        .filter(
          (p) =>
            p.status === "success" &&
            new Date(p.date).getMonth() === dt.getMonth() &&
            new Date(p.date).getFullYear() === dt.getFullYear(),
        )
        .reduce((s, p) => s + p.amountInr, 0);
      revByMonth.push({ month: label, inr });
    }

    return {
      activeSubscribers: active.length,
      pausedSubscribers: db.subscriptions.filter((s) => s.status === "paused").length,
      cancelled: db.subscriptions.filter((s) => s.status === "cancelled").length,
      newThisMonth: db.customers.filter(
        (c) =>
          new Date(c.createdAt).getMonth() === now.getMonth() &&
          new Date(c.createdAt).getFullYear() === now.getFullYear(),
      ).length,
      mrrInr: active.reduce((s, sub) => s + monthlyEquivalent(sub), 0),
      revenueCollectedInr: db.payments
        .filter((p) => p.status === "success")
        .reduce((s, p) => s + p.amountInr, 0),
      ordersToday: db.orders.filter(
        (o) => sameDay(o.deliveryDate, now) && o.status !== "skipped",
      ).length,
      openTickets: db.tickets.filter((t) => t.status === "open").length,
      planMix: [...planCounts.entries()].map(([plan, count]) => ({ plan, count })).sort((a, b) => b.count - a.count),
      revenueByMonth: revByMonth,
      dietMix: [...dietCounts.entries()].map(([diet, count]) => ({ diet: diet as Kpis["dietMix"][number]["diet"], count })),
    };
  },

  // ---- customers ----
  customers: () => load().customers,
  customer: (id: string) => load().customers.find((c) => c.id === id) ?? null,
  customerDetail(id: string) {
    const db = load();
    const subscription = db.subscriptions.find((s) => s.userId === id) ?? null;
    const subIds = new Set(db.subscriptions.filter((s) => s.userId === id).map((s) => s.id));
    return {
      customer: db.customers.find((c) => c.id === id) ?? null,
      subscription,
      orders: db.orders.filter((o) => subIds.has(o.subscriptionId)),
      invoices: db.invoices.filter((i) => subIds.has(i.subscriptionId)),
      payments: db.payments.filter((p) => p.customerId === id),
      tickets: db.tickets.filter((t) => t.customerId === id),
    };
  },
  updateCustomer: (id: string, patch: Partial<AdminCustomer>) =>
    mutate((db) => {
      const c = db.customers.find((x) => x.id === id);
      if (c) Object.assign(c, patch);
      return c ?? null;
    }),
  removeCustomer: (id: string) =>
    mutate((db) => {
      db.customers = db.customers.filter((c) => c.id !== id);
      const subs = db.subscriptions.filter((s) => s.userId === id).map((s) => s.id);
      db.subscriptions = db.subscriptions.filter((s) => s.userId !== id);
      db.orders = db.orders.filter((o) => !subs.includes(o.subscriptionId));
      db.tickets = db.tickets.filter((t) => t.customerId !== id);
    }),

  // ---- subscriptions ----
  subscriptions: () => load().subscriptions,
  subscription: (id: string) => load().subscriptions.find((s) => s.id === id) ?? null,
  customerFor: (sub: Subscription) => load().customers.find((c) => c.id === sub.userId) ?? null,
  setSubscriptionStatus: (id: string, status: Subscription["status"]) =>
    mutate((db) => {
      const s = db.subscriptions.find((x) => x.id === id);
      if (s) s.status = status;
      if (s && (status === "paused" || status === "active")) {
        db.orders.forEach((o) => {
          if (o.subscriptionId === id && (o.status === "upcoming" || o.status === "paused"))
            o.status = status === "paused" ? "paused" : "upcoming";
        });
      }
      return s ?? null;
    }),

  // ---- orders ----
  orders: () => load().orders,
  ordersOn(dateISO: string) {
    const day = new Date(dateISO);
    return load().orders.filter((o) => sameDay(o.deliveryDate, day));
  },
  setOrderStatus: (id: string, status: Order["status"]) =>
    mutate((db) => {
      const o = db.orders.find((x) => x.id === id);
      if (o) o.status = status;
      return o ?? null;
    }),

  // ---- catalog (shared with the storefront via catalogStore) ----
  meals: (): Meal[] => catalogStore.meals(),
  saveMeal: (meal: Meal) => catalogStore.saveMeal(meal),
  removeMeal: (id: string) => catalogStore.removeMeal(id),

  plans: (): Plan[] => catalogStore.plans(),
  savePlan: (plan: Plan) => catalogStore.savePlan(plan),
  removePlan: (id: string) => catalogStore.removePlan(id),

  coupons: (): Coupon[] => catalogStore.coupons(),
  saveCoupon: (coupon: Coupon) => catalogStore.saveCoupon(coupon),
  removeCoupon: (code: string) => catalogStore.removeCoupon(code),

  // ---- storefront → admin sync ----
  // Called when a customer completes checkout so their account + subscription
  // + orders + payment appear in the admin console.
  importStorefront(input: {
    user: User;
    subscription: Subscription;
    orders: Order[];
    invoice: Invoice;
    method: PaymentMethod;
    city: string;
    amountInr: number;
  }) {
    return mutate((db) => {
      const { user, subscription, orders, invoice, method, city, amountInr } = input;
      const existing = db.customers.find((c) => c.id === user.id);
      const customer: AdminCustomer = {
        id: user.id,
        name: user.name || "Customer",
        email: user.email || `${user.id}@storefront`,
        phone: user.phone || "",
        phoneVerified: !!user.phone_verified,
        emailVerified: !!user.email_verified,
        city: city || existing?.city || "—",
        createdAt: existing?.createdAt || new Date().toISOString(),
        status: "active",
        goal: subscription.goal,
        diet: subscription.diet,
        allergyIds: [],
      };
      if (existing) Object.assign(existing, customer);
      else db.customers.unshift(customer);

      // supersede any prior active subscription for this customer
      db.subscriptions.forEach((s) => {
        if (s.userId === user.id && s.status === "active") s.status = "cancelled";
      });
      const si = db.subscriptions.findIndex((s) => s.id === subscription.id);
      if (si >= 0) db.subscriptions[si] = subscription;
      else db.subscriptions.unshift(subscription);

      const orderIds = new Set(db.orders.map((o) => o.id));
      orders.forEach((o) => { if (!orderIds.has(o.id)) db.orders.push(o); });

      if (!db.invoices.find((i) => i.id === invoice.id)) db.invoices.unshift(invoice);

      db.payments.unshift({
        id: `pay-${subscription.id}`,
        customerId: user.id,
        subscriptionId: subscription.id,
        method,
        amountInr,
        status: "success",
        date: new Date().toISOString(),
      });
    });
  },

  // ---- payments / invoices ----
  payments: () => load().payments,
  invoices: () => load().invoices,
  refundPayment: (id: string) =>
    mutate((db) => {
      const p = db.payments.find((x) => x.id === id);
      if (p) p.status = "refunded";
      return p ?? null;
    }),

  // ---- reviews ----
  reviews: () => load().reviews,
  setReviewApproved: (id: string, approved: boolean) =>
    mutate((db) => {
      const r = db.reviews.find((x) => x.id === id);
      if (r) r.approved = approved;
      return r ?? null;
    }),
  removeReview: (id: string) => mutate((db) => { db.reviews = db.reviews.filter((r) => r.id !== id); }),

  // ---- support tickets ----
  tickets: () => load().tickets,
  ticket: (id: string) => load().tickets.find((t) => t.id === id) ?? null,
  replyTicket: (id: string, author: string, message: string) =>
    mutate((db) => {
      const t = db.tickets.find((x) => x.id === id);
      if (t) {
        t.messages.push({ from: "admin", author, message, at: new Date().toISOString() });
        t.status = "open";
      }
      return t ?? null;
    }),
  setTicketStatus: (id: string, status: SupportTicket["status"]) =>
    mutate((db) => {
      const t = db.tickets.find((x) => x.id === id);
      if (t) t.status = status;
      return t ?? null;
    }),

  // ---- settings ----
  settings: () => load().settings,
  updateSettings: (patch: Partial<AdminSettings>) =>
    mutate((db) => {
      db.settings = { ...db.settings, ...patch };
      return db.settings;
    }),

  // ---- admin users ----
  admins: () => load().admins,
  findAdmin: (email: string, password: string) =>
    load().admins.find(
      (a) => a.active && a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password,
    ) ?? null,
  saveAdmin: (admin: AdminUser) =>
    mutate((db) => {
      const i = db.admins.findIndex((a) => a.id === admin.id);
      if (i >= 0) db.admins[i] = admin;
      else db.admins.push({ ...admin, id: admin.id || uid("adm") });
    }),
  removeAdmin: (id: string) => mutate((db) => { db.admins = db.admins.filter((a) => a.id !== id); }),
};
