import { getAllergen } from "@/lib/mock/catalog";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui";
import type { MacroSplit } from "@/lib/types";

/** Star rating with numeric value. */
export function RatingStars({
  rating,
  count,
  className,
}: {
  rating: number;
  count?: number;
  className?: string;
}) {
  const full = Math.round(rating);
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm", className)}>
      <span aria-hidden className="text-accent">
        {"★".repeat(full)}
        <span className="text-neutral/50">{"★".repeat(5 - full)}</span>
      </span>
      <span className="font-semibold text-primary">{rating.toFixed(1)}</span>
      {count != null && <span className="text-muted">({count})</span>}
    </span>
  );
}

/** Protein / Carbs / Fat split as three labelled bars. */
export function MacroBars({ split }: { split: MacroSplit }) {
  const rows = [
    { label: "Protein", pct: split.protein_pct, color: "bg-primary" },
    { label: "Carbs", pct: split.carb_pct, color: "bg-neutral" },
    { label: "Fat", pct: split.fat_pct, color: "bg-accent" },
  ];
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3">
          <span className="w-14 text-xs text-muted">{r.label}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral/20">
            <div
              className={cn("h-full rounded-full", r.color)}
              style={{ width: `${r.pct}%` }}
            />
          </div>
          <span className="w-9 text-right text-xs font-semibold text-primary">
            {r.pct}%
          </span>
        </div>
      ))}
    </div>
  );
}

/** Allergen chips from a list of allergen ids. */
export function AllergenTags({ ids }: { ids: string[] }) {
  if (ids.length === 0)
    return (
      <Badge variant="success" size="sm">
        No major allergens
      </Badge>
    );
  return (
    <div className="flex flex-wrap gap-1.5">
      {ids.map((id) => {
        const a = getAllergen(id);
        if (!a) return null;
        return (
          <Badge key={id} variant="surface" size="sm">
            <span aria-hidden>{a.icon}</span> {a.name}
          </Badge>
        );
      })}
    </div>
  );
}

/** Trust badges for the home / value-prop screens. */
export function TrustBadges({ className }: { className?: string }) {
  const items = [
    { icon: "🛡️", label: "FSSAI certified" },
    { icon: "🥗", label: "Dietitian-designed" },
    { icon: "🚚", label: "Fresh daily delivery" },
    { icon: "🇮🇳", label: "Made for India" },
  ];
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {items.map((i) => (
        <Badge key={i.label} variant="outline">
          <span aria-hidden>{i.icon}</span> {i.label}
        </Badge>
      ))}
    </div>
  );
}

/** Big emoji "photo" stand-in used across meal/plan cards. */
export function EmojiThumb({
  emoji,
  className,
}: {
  emoji: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-neutral/20 text-5xl select-none",
        className,
      )}
      aria-hidden
    >
      {emoji}
    </div>
  );
}
