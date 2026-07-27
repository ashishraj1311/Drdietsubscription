import Link from "next/link";
import { Badge, Button, Card, CardBody } from "@/components/ui";
import { RatingStars } from "@/components/shared/bits";
import { avgRating, getReviews } from "@/lib/mock/catalog";
import { longDate } from "@/lib/format";

export default function ReviewsPage() {
  const reviews = getReviews();
  const rating = avgRating();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold">Reviews</h1>
      <div className="mt-3 flex items-center gap-4">
        <span className="text-4xl font-bold">{rating.toFixed(1)}</span>
        <div>
          <RatingStars rating={rating} />
          <p className="text-sm text-muted">
            Based on {reviews.length * 40}+ verified members
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {reviews.map((r) => (
          <Card key={r.id}>
            <CardBody>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-bold text-primary">
                    {r.user_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold leading-tight">{r.user_name}</p>
                    <p className="text-xs text-muted">{longDate(r.created_at)}</p>
                  </div>
                </div>
                <RatingStars rating={r.rating} />
              </div>
              {r.goal_tag && (
                <Badge variant="neutral" size="sm" className="mt-3">
                  {r.goal_tag}
                </Badge>
              )}
              <p className="mt-2 text-sm text-primary">{r.comment}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link href="/build">
          <Button size="lg">Start your plan</Button>
        </Link>
      </div>
    </main>
  );
}
