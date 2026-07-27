import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { RatingStars } from "./bits";
import { Thumb } from "./Thumb";
import { dietLabel, goalLabel, inr } from "@/lib/format";
import type { Plan } from "@/lib/types";

export function PlanCard({ plan }: { plan: Plan }) {
  return (
    <Card interactive className="flex h-full flex-col">
      <Link href={`/plans/${plan.id}`} className="flex h-full flex-col">
        <div className="relative">
          <Thumb
            src={`/plans/${plan.id}.jpg`}
            emoji={plan.emoji}
            alt={plan.name}
            className="h-32 w-full"
          />
          <div className="absolute left-3 top-3 flex gap-1.5">
            <Badge variant="accent" size="sm">
              {dietLabel(plan.diet_type)}
            </Badge>
            <Badge variant="surface" size="sm">
              {goalLabel(plan.goal)}
            </Badge>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold leading-tight">{plan.name}</h3>
              <p className="text-xs text-muted">{plan.tagline}</p>
            </div>
          </div>
          <div className="mt-2">
            <RatingStars rating={plan.rating} count={plan.review_count} />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {plan.highlights.map((h) => (
              <Badge key={h} variant="neutral" size="sm">
                {h}
              </Badge>
            ))}
          </div>
          <div className="mt-auto flex items-end justify-between pt-4">
            <div>
              <p className="text-xs text-muted">{plan.calories_per_day} kcal/day</p>
              <p className="text-lg font-bold">
                {inr(plan.price_per_day_inr)}
                <span className="text-xs font-normal text-muted"> /day</span>
              </p>
            </div>
            <span className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-light">
              View plan
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
}
