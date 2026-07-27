import Link from "next/link";
import { Badge, Button } from "@/components/ui";
import { getPlans } from "@/lib/mock/catalog";
import { dietLabel, goalLabel, inr } from "@/lib/format";

// Compare screen — nutrition side-by-side WITHOUT a click-through (journey-map
// pain point: "comparing meals and nutrition is difficult").
export default function ComparePage() {
  const plans = getPlans();

  const rows: { label: string; render: (p: (typeof plans)[number]) => React.ReactNode }[] = [
    { label: "Diet", render: (p) => <Badge variant="accent" size="sm">{dietLabel(p.diet_type)}</Badge> },
    { label: "Best for", render: (p) => goalLabel(p.goal) },
    { label: "Calories / day", render: (p) => `${p.calories_per_day} kcal` },
    { label: "Protein", render: (p) => `${p.macro_split.protein_pct}%` },
    { label: "Carbs", render: (p) => `${p.macro_split.carb_pct}%` },
    { label: "Fat", render: (p) => `${p.macro_split.fat_pct}%` },
    { label: "Rating", render: (p) => `★ ${p.rating} (${p.review_count})` },
    {
      label: "Price / day",
      render: (p) => <span className="font-bold">{inr(p.price_per_day_inr)}</span>,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold">Compare plans</h1>
      <p className="mt-1 text-sm text-muted">
        Nutrition and pricing side by side — no digging through detail pages.
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="sticky left-0 bg-surface p-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                Plan
              </th>
              {plans.map((p) => (
                <th key={p.id} className="p-4 text-left align-top">
                  <div className="text-2xl" aria-hidden>
                    {p.emoji}
                  </div>
                  <div className="mt-1 font-bold text-primary">{p.name}</div>
                  <div className="text-xs font-normal text-muted">{p.tagline}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-border last:border-0">
                <td className="sticky left-0 bg-surface p-4 text-xs font-semibold uppercase tracking-wide text-muted">
                  {row.label}
                </td>
                {plans.map((p) => (
                  <td key={p.id} className="p-4 text-primary">
                    {row.render(p)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="sticky left-0 bg-surface p-4" />
              {plans.map((p) => (
                <td key={p.id} className="p-4">
                  <Link href={`/plans/${p.id}`}>
                    <Button size="sm" fullWidth>
                      View plan
                    </Button>
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-center">
        <Link href="/build">
          <Button variant="outline">Or build a fully custom plan →</Button>
        </Link>
      </div>
    </main>
  );
}
