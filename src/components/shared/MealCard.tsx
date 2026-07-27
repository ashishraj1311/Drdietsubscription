import { Card } from "@/components/ui";
import { AllergenTags } from "./bits";
import { Thumb } from "./Thumb";
import { dietLabel, proteinLabel, slotLabel } from "@/lib/format";
import type { Meal } from "@/lib/types";

export function MealCard({ meal }: { meal: Meal }) {
  return (
    <Card tone="canvas" className="flex flex-col">
      <Thumb
        src={`/meals/${meal.id}.jpg`}
        emoji={meal.emoji}
        alt={meal.name}
        className="h-28 w-full"
      />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold leading-tight">{meal.name}</h3>
          <span className="shrink-0 rounded-sm bg-accent px-2 py-0.5 text-[11px] font-semibold text-primary">
            {slotLabel(meal.slot)}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted">{meal.description}</p>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-primary">
          <span className="font-semibold">{meal.calories} kcal</span>
          <span>{meal.protein_g}g protein</span>
          <span>{meal.carbs_g}g carbs</span>
          <span>{meal.fat_g}g fat</span>
        </div>
        <div className="mt-3">
          <AllergenTags ids={meal.allergen_ids} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border pt-3 text-xs text-muted">
          <span>Protein: {proteinLabel(meal.protein_option)}</span>
          <span aria-hidden>·</span>
          <span>{meal.diet_types.map(dietLabel).join(" / ")}</span>
        </div>
      </div>
    </Card>
  );
}
