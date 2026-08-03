"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  Badge,
  BottomSheet,
  Button,
  Card,
  CardBody,
  Input,
  PageLoader,
  Select,
} from "@/components/ui";
import { PageHeader } from "@/components/admin/bits";
import { useAdmin } from "@/lib/admin/useAdmin";
import { adminStore } from "@/lib/admin/store";
import { inr } from "@/lib/format";
import type { Coupon } from "@/lib/types";

const blank = (): Coupon => ({
  code: "", label: "", discount_type: "flat_inr", value: 100, is_first_time_buyer_only: false,
});

const typeLabel: Record<Coupon["discount_type"], string> = {
  flat_inr: "Flat ₹",
  percent: "Percent",
  cashback_inr: "Cashback ₹",
};

export default function CouponsPage() {
  const { hydrated, tick, refresh } = useAdmin();
  const [draft, setDraft] = useState<Coupon | null>(null);
  const [isNew, setIsNew] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- tick re-reads the store after mutations
  const coupons = useMemo(() => (hydrated ? adminStore.coupons() : []), [hydrated, tick]);
  if (!hydrated) return <PageLoader />;

  const valueLabel = (c: Coupon) =>
    c.discount_type === "percent" ? `${c.value}%` : inr(c.value);

  return (
    <>
      <PageHeader title="Coupons" subtitle={`${coupons.length} active offers`}>
        <Button size="sm" onClick={() => { setDraft(blank()); setIsNew(true); }}><Plus size={16} /> New coupon</Button>
      </PageHeader>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((c) => (
          <Card key={c.code}>
            <CardBody>
              <div className="flex items-start justify-between">
                <span className="rounded-md border border-dashed border-primary bg-primary-light px-2.5 py-1 font-mono text-sm font-bold text-primary">{c.code}</span>
                <div className="flex gap-1">
                  <button aria-label="Edit" className="text-muted hover:text-primary" onClick={() => { setDraft({ ...c }); setIsNew(false); }}><Pencil size={16} /></button>
                  <button aria-label="Delete" className="text-muted hover:text-danger" onClick={() => { if (confirm(`Delete ${c.code}?`)) { adminStore.removeCoupon(c.code); refresh(); } }}><Trash2 size={16} /></button>
                </div>
              </div>
              <p className="mt-2 text-sm font-semibold">{c.label}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                <Badge variant="accent" size="sm">{typeLabel[c.discount_type]} {valueLabel(c)}</Badge>
                {c.is_first_time_buyer_only && <Badge variant="surface" size="sm">First-time only</Badge>}
                {c.min_order_inr ? <Badge variant="neutral" size="sm">Min {inr(c.min_order_inr)}</Badge> : null}
              </div>
            </CardBody>
          </Card>
        ))}
        {coupons.length === 0 && <p className="text-sm text-muted">No coupons yet.</p>}
      </div>

      <BottomSheet open={!!draft} onClose={() => setDraft(null)} title={isNew ? "New coupon" : "Edit coupon"}>
        {draft && (
          <div className="space-y-3">
            <Input label="Code" value={draft.code} disabled={!isNew} onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase().replace(/\s/g, "") })} hint={isNew ? "Uppercase, no spaces" : "Code can't be changed"} />
            <Input label="Label (shown to customers)" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Type" value={draft.discount_type} onChange={(e) => setDraft({ ...draft, discount_type: e.target.value as Coupon["discount_type"] })}>
                <option value="flat_inr">Flat ₹ off</option>
                <option value="percent">Percent off</option>
                <option value="cashback_inr">Cashback ₹</option>
              </Select>
              <Input label={draft.discount_type === "percent" ? "Percent" : "Amount ₹"} inputMode="numeric" value={draft.value} onChange={(e) => setDraft({ ...draft, value: +e.target.value || 0 })} />
            </div>
            <Input label="Minimum order ₹ (optional)" inputMode="numeric" value={draft.min_order_inr ?? ""} onChange={(e) => setDraft({ ...draft, min_order_inr: e.target.value ? +e.target.value : undefined })} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={draft.is_first_time_buyer_only} onChange={(e) => setDraft({ ...draft, is_first_time_buyer_only: e.target.checked })} />
              First-time buyers only
            </label>
            <Button fullWidth disabled={!draft.code.trim() || !draft.label.trim()} onClick={() => { adminStore.saveCoupon(draft); setDraft(null); refresh(); }}>
              Save coupon
            </Button>
          </div>
        )}
      </BottomSheet>
    </>
  );
}
