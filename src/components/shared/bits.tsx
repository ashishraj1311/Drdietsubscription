import { MapPin, Salad, ShieldCheck, Star, Truck } from "lucide-react";
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
      <span className="inline-flex items-center" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            className={
              i < full ? "fill-accent text-accent" : "fill-none text-neutral/50"
            }
          />
        ))}
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
    { Icon: ShieldCheck, label: "FSSAI certified" },
    { Icon: Salad, label: "Dietitian-designed" },
    { Icon: Truck, label: "Fresh daily delivery" },
    { Icon: MapPin, label: "Made for India" },
  ];
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {items.map(({ Icon, label }) => (
        <Badge key={label} variant="outline">
          <Icon size={13} className="text-primary" aria-hidden /> {label}
        </Badge>
      ))}
    </div>
  );
}

/**
 * "Photo" tile used across meal/plan cards. Renders a real image when `src` is
 * provided, otherwise a soft branded gradient with the dish emoji as a stand-in
 * (swap in food photography by passing `src`).
 */
export function EmojiThumb({
  emoji,
  src,
  alt,
  className,
}: {
  emoji: string;
  src?: string;
  alt?: string;
  className?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt ?? ""}
        className={cn("object-cover", className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-gradient-to-br from-primary-light to-neutral/30 text-5xl select-none",
        className,
      )}
      aria-hidden
    >
      {emoji}
    </div>
  );
}
