import Link from "next/link";
import { Button } from "@/components/ui";

const FAQ_GROUPS: { category: string; items: { q: string; a: string }[] }[] = [
  {
    category: "Getting started",
    items: [
      {
        q: "Do I have to commit to a full plan right away?",
        a: "No. Start with our Trial pack (3 meals in a single day) to taste the food before choosing a Weekly, Monthly or Quarterly plan. Trials are one-time and never auto-renew.",
      },
      {
        q: "Do I need to enter my weight and height?",
        a: "It's optional. You can skip the Body Analysis step and we'll use a sensible calorie target based on your goal — you can fine-tune it anytime.",
      },
    ],
  },
  {
    category: "Delivery",
    items: [
      {
        q: "Do you deliver to my area?",
        a: "We check serviceability by pincode right at checkout, before you fill in anything else. We currently deliver across parts of Mumbai, Pune and Bengaluru, with more areas being added.",
      },
      {
        q: "Can I change my delivery time or address?",
        a: "Yes — from your dashboard, up to the daily cut-off (12:00 noon for next-day delivery). You can also skip or pause individual days.",
      },
      {
        q: "Do you deliver on Sundays?",
        a: "No, we don't deliver on Sundays. Weekly plans are billed for 6 delivery days.",
      },
    ],
  },
  {
    category: "Ingredients & nutrition",
    items: [
      {
        q: "How accurate are the nutrition facts?",
        a: "Every dish lists calories and protein/carbs/fat, portioned and weighed in our FSSAI-certified kitchen. Macros are shown on each meal card so you can compare before ordering.",
      },
      {
        q: "Can I flag allergies or ingredients I dislike?",
        a: "Yes. Select allergens during plan building and add disliked ingredients — we flag and avoid them, and surface the tags on every meal card.",
      },
      {
        q: "Is the food vegetarian-friendly?",
        a: "We offer Veg, Non-Veg (chicken, fish, egg), Vegan and Eggetarian diets. Non-veg is limited to chicken, fish and egg — never red meat or pork.",
      },
    ],
  },
  {
    category: "Billing",
    items: [
      {
        q: "Will I be charged every month automatically?",
        a: "Only if you choose an auto-renewing plan (Weekly/Monthly/Quarterly), and we state it in plain language on the order review screen before you pay. Trials are one-time. You can cancel auto-renewal anytime from your dashboard.",
      },
      {
        q: "How do I pay?",
        a: "UPI (default), plus Card, Netbanking and Wallets. All prices are in ₹ (INR), inclusive of GST shown at checkout.",
      },
    ],
  },
];

export default function FaqsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold">Frequently asked questions</h1>
      <p className="mt-1 text-sm text-muted">
        Everything about trials, delivery, nutrition and billing.
      </p>

      <div className="mt-8 space-y-8">
        {FAQ_GROUPS.map((group) => (
          <section key={group.category}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
              {group.category}
            </h2>
            <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
              {group.items.map((item) => (
                <details key={item.q} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 font-semibold text-primary [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span className="shrink-0 text-muted transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="px-4 pb-4 text-sm text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 rounded-lg bg-primary p-6 text-center">
        <p className="text-lg font-bold text-primary-light">Still have a question?</p>
        <p className="mt-1 text-sm text-primary-light/80">
          Our team is happy to help before you commit.
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <Link href="/build">
            <Button variant="accent">Build my plan</Button>
          </Link>
          <Link href="/dashboard/support">
            <Button variant="outline" className="border-primary-light text-primary-light hover:bg-primary-light/10">
              Contact support
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
