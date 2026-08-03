"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { Badge, Button, Card, CardBody, Chip, PageLoader } from "@/components/ui";
import { PageHeader } from "@/components/admin/bits";
import { RatingStars } from "@/components/shared/bits";
import { useAdmin } from "@/lib/admin/useAdmin";
import { adminStore } from "@/lib/admin/store";
import { getPlan } from "@/lib/mock/catalog";
import { longDate } from "@/lib/format";

type Filter = "all" | "pending" | "approved";

export default function ReviewsPage() {
  const { hydrated, tick, refresh } = useAdmin();
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(() => {
    if (!hydrated) return [];
    return adminStore.reviews().filter((r) =>
      filter === "all" ? true : filter === "approved" ? r.approved : !r.approved,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tick re-reads the store after mutations
  }, [hydrated, tick, filter]);

  if (!hydrated) return <PageLoader />;
  const pending = adminStore.reviews().filter((r) => !r.approved).length;

  return (
    <>
      <PageHeader title="Reviews" subtitle={`${pending} awaiting moderation`} />

      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "pending", "approved"] as Filter[]).map((f) => (
          <Chip key={f} selected={filter === f} onClick={() => setFilter(f)}>{f[0].toUpperCase() + f.slice(1)}</Chip>
        ))}
      </div>

      <div className="space-y-3">
        {rows.map((r) => (
          <Card key={r.id}>
            <CardBody>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{r.userName}</span>
                    <RatingStars rating={r.rating} />
                    <Badge variant={r.approved ? "success" : "surface"} size="sm">{r.approved ? "Approved" : "Pending"}</Badge>
                    {r.planId && <Badge variant="neutral" size="sm">{getPlan(r.planId)?.name ?? r.planId}</Badge>}
                  </div>
                  <p className="mt-2 text-sm text-primary">{r.comment}</p>
                  <p className="mt-1 text-xs text-muted">{longDate(r.createdAt)}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Button size="sm" variant={r.approved ? "outline" : "primary"} onClick={() => { adminStore.setReviewApproved(r.id, !r.approved); refresh(); }}>
                    {r.approved ? "Unpublish" : "Approve"}
                  </Button>
                  <button aria-label="Delete" className="text-muted hover:text-danger" onClick={() => { if (confirm("Delete this review?")) { adminStore.removeReview(r.id); refresh(); } }}><Trash2 size={16} /></button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
        {rows.length === 0 && <p className="text-sm text-muted">No reviews.</p>}
      </div>
    </>
  );
}
