// Domain types — mirror docs/05-DATA-MODEL.md.
// Hard constraints baked in: money is INR-only (`_inr`), protein never includes beef.

export type Goal =
  | "lose_weight"
  | "gain_muscle"
  | "maintain"
  | "eat_healthier"
  | "custom";

export type DietPreference = "veg" | "non_veg" | "vegan" | "eggetarian";

export type MealSlot = "breakfast" | "lunch" | "evening_snack" | "dinner";

// NOTE: `beef` is intentionally absent and must never be added (PRD constraint).
export type ProteinOption =
  | "paneer"
  | "chicken"
  | "fish"
  | "egg"
  | "soya"
  | "tofu"
  | "lentil";

export type DurationType = "trial" | "weekly" | "monthly" | "quarterly";

export type Gender = "male" | "female" | "other";

export interface Allergen {
  id: string;
  name: string;
  icon: string; // emoji stand-in
}

export interface Meal {
  id: string;
  name: string;
  slot: MealSlot;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  protein_option: ProteinOption;
  allergen_ids: string[];
  diet_types: DietPreference[]; // which diets this meal is valid for
  emoji: string; // image stand-in
  description: string;
}

export interface MacroSplit {
  protein_pct: number;
  carb_pct: number;
  fat_pct: number;
}

export interface Plan {
  id: string;
  name: string;
  tagline: string;
  diet_type: DietPreference;
  goal: Goal;
  description: string;
  macro_split: MacroSplit;
  calories_per_day: number;
  price_per_day_inr: number;
  sample_meal_ids: string[];
  rating: number;
  review_count: number;
  emoji: string;
  highlights: string[];
}

export interface Review {
  id: string;
  plan_id: string | null;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string; // ISO date
  goal_tag?: string;
}

export interface Coupon {
  code: string;
  label: string;
  discount_type: "flat_inr" | "percent" | "cashback_inr";
  value: number;
  is_first_time_buyer_only: boolean;
  min_order_inr?: number;
}

export type PaymentMethod = "upi" | "card" | "netbanking" | "wallet";
export type BillingCadence = "one_time" | "auto_renew";

// ---- User & session ----

export type AuthProvider = "otp" | "google" | "guest";

export interface User {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  auth_provider: AuthProvider;
  phone_verified: boolean;
  email_verified: boolean;
  created_at: string;
  // body analysis (all nullable — skippable per PRD)
  goal?: Goal;
  diet_preference?: DietPreference;
  height_cm?: number | null;
  weight_kg?: number | null;
  age?: number | null;
  gender?: Gender | null;
}

// ---- Plan builder (wizard) working state ----

export interface MealCustomization {
  slot: MealSlot;
  protein_option: ProteinOption;
  side?: string;
  calorie_tier: "light" | "standard" | "hearty";
  portion: "regular" | "large";
}

export interface PlanBuilderState {
  goal: Goal | null;
  bodyAnalysis: {
    skipped: boolean;
    height_cm: number | null;
    weight_kg: number | null;
    age: number | null;
    gender: Gender | null;
  };
  diet: DietPreference | null;
  allergenIds: string[];
  dislikes: string[];
  mealSlots: MealSlot[];
  duration: DurationType | null;
  cuisinePrefs: string[];
  customizations: MealCustomization[];
  planId: string | null; // optionally anchored to a curated plan
}

// ---- Checkout & subscription ----

export interface ContactDetails {
  name: string;
  phone: string;
  email: string;
}

export interface AddressData {
  label: "home" | "work" | "other";
  city: string;
  area: string;
  pincode: string;
  line1: string;
  serviceable: boolean;
  linkedMealSlot?: MealSlot; // when per-slot addresses are used
}

export interface DeliveryPrefs {
  slot: string; // time window
  instructionPresets: string[];
  instructionFreetext: string;
  startDate: string; // ISO
}

export interface CheckoutState {
  contact: ContactDetails;
  addressMode: "same" | "different";
  address: AddressData | null; // when "same"
  perSlotAddresses: Record<string, AddressData>; // when "different"
  delivery: DeliveryPrefs;
  couponCode: string | null;
}

export type SubscriptionStatus = "active" | "paused" | "cancelled";
export type OrderStatus = "upcoming" | "delivered" | "skipped" | "paused";

export interface Subscription {
  id: string;
  userId: string;
  planName: string;
  diet: DietPreference;
  goal: Goal;
  mealSlots: MealSlot[];
  duration: DurationType;
  caloriesPerDay: number;
  startDate: string;
  status: SubscriptionStatus;
  pricePerDayInr: number;
  totalPriceInr: number;
  billingCadence: BillingCadence;
  createdAt: string;
}

export interface Order {
  id: string;
  subscriptionId: string;
  deliveryDate: string;
  mealSlot: MealSlot;
  mealName: string;
  status: OrderStatus;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  amountInr: number;
  gstInr: number;
  date: string;
}

// ---- Pricing ----

export interface PriceBreakdown {
  subtotalInr: number;
  gstInr: number;
  deliveryFeeInr: number;
  discountInr: number;
  totalInr: number;
  perDayInr: number;
  days: number;
  billingCadence: BillingCadence;
}
