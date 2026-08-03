// Admin-console types. Reuses storefront domain types where possible.
import type {
  Coupon,
  DietPreference,
  DurationType,
  Goal,
  Invoice,
  Meal,
  MealSlot,
  Order,
  PaymentMethod,
  Plan,
  Subscription,
} from "@/lib/types";

export type AdminRole = "super_admin" | "ops" | "support";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  password: string; // plaintext — MOCK/demo only, never do this for real
  role: AdminRole;
  active: boolean;
}

// A customer record as the admin sees it — the storefront User plus everything
// attached to them, denormalized for easy listing/detail.
export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  city: string;
  createdAt: string;
  status: "active" | "suspended";
  goal: Goal;
  diet: DietPreference;
  allergyIds: string[];
}

export interface AdminPayment {
  id: string;
  customerId: string;
  subscriptionId: string;
  method: PaymentMethod;
  amountInr: number;
  status: "success" | "failed" | "refunded";
  date: string;
}

export interface TicketReply {
  from: "customer" | "admin";
  author: string;
  message: string;
  at: string;
}

export interface SupportTicket {
  id: string;
  customerId: string;
  customerName: string;
  subject: string;
  status: "open" | "resolved";
  createdAt: string;
  messages: TicketReply[];
}

export interface AdminReview {
  id: string;
  planId: string | null;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  approved: boolean;
}

export interface AdminSettings {
  perMealInr: number;
  gstRate: number; // 0..1
  deliveryFee: Record<DurationType, number>;
  serviceablePincodePrefixes: string[];
  deliverySlots: string[];
  businessName: string;
  fssaiLicense: string;
}

// The whole persisted admin dataset.
export interface AdminDb {
  admins: AdminUser[];
  customers: AdminCustomer[];
  subscriptions: Subscription[];
  orders: Order[];
  invoices: Invoice[];
  payments: AdminPayment[];
  meals: Meal[];
  plans: Plan[];
  coupons: Coupon[];
  reviews: AdminReview[];
  tickets: SupportTicket[];
  settings: AdminSettings;
}

export interface Kpis {
  activeSubscribers: number;
  pausedSubscribers: number;
  cancelled: number;
  newThisMonth: number;
  mrrInr: number; // approximate monthly recurring revenue
  revenueCollectedInr: number;
  ordersToday: number;
  openTickets: number;
  planMix: { plan: string; count: number }[];
  revenueByMonth: { month: string; inr: number }[];
  dietMix: { diet: DietPreference; count: number }[];
}

export type { MealSlot };
