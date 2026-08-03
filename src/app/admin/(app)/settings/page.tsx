"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
import { useAdminAuth } from "@/lib/admin/AdminAuthProvider";
import { adminStore } from "@/lib/admin/store";
import type { AdminRole, AdminSettings, AdminUser } from "@/lib/admin/types";
import type { DurationType } from "@/lib/types";

const ROLES: AdminRole[] = ["super_admin", "ops", "support"];
const roleLabel: Record<AdminRole, string> = { super_admin: "Super Admin", ops: "Kitchen / Ops", support: "Support" };

export default function SettingsPage() {
  const { hydrated, tick, refresh } = useAdmin();
  const { admin } = useAdminAuth();
  const [form, setForm] = useState<AdminSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [draft, setDraft] = useState<AdminUser | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (hydrated) setForm(adminStore.settings());
  }, [hydrated]);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- tick re-reads the store after mutations
  const admins = useMemo(() => (hydrated ? adminStore.admins() : []), [hydrated, tick]);

  if (!hydrated || !form) return <PageLoader />;

  const setFee = (d: DurationType, v: number) =>
    setForm({ ...form, deliveryFee: { ...form.deliveryFee, [d]: v } });

  function save() {
    if (!form) return;
    adminStore.updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <PageHeader title="Settings" subtitle="Pricing, serviceability, and staff access.">
        <Button size="sm" onClick={save}>Save changes</Button>
        {saved && <Badge variant="success">Saved</Badge>}
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardBody className="space-y-3">
            <p className="text-sm font-semibold">Business</p>
            <Input label="Business name" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
            <Input label="FSSAI license" value={form.fssaiLicense} onChange={(e) => setForm({ ...form, fssaiLicense: e.target.value })} />
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-3">
            <p className="text-sm font-semibold">Pricing</p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Per-meal price ₹" inputMode="numeric" value={form.perMealInr} onChange={(e) => setForm({ ...form, perMealInr: +e.target.value || 0 })} />
              <Input label="GST %" inputMode="numeric" value={Math.round(form.gstRate * 100)} onChange={(e) => setForm({ ...form, gstRate: (+e.target.value || 0) / 100 })} />
            </div>
            <p className="pt-1 text-xs font-semibold text-muted">Delivery fee ₹ by plan</p>
            <div className="grid grid-cols-4 gap-2">
              {(["trial", "weekly", "monthly", "quarterly"] as DurationType[]).map((d) => (
                <Input key={d} label={d[0].toUpperCase() + d.slice(1)} inputMode="numeric" value={form.deliveryFee[d]} onChange={(e) => setFee(d, +e.target.value || 0)} />
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardBody className="space-y-3">
            <p className="text-sm font-semibold">Serviceability</p>
            <Input
              label="Serviceable pincode prefixes (comma-separated)"
              value={form.serviceablePincodePrefixes.join(", ")}
              onChange={(e) => setForm({ ...form, serviceablePincodePrefixes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
              hint="First 3 digits, e.g. 400, 411, 560"
            />
            <Input
              label="Delivery slots (comma-separated)"
              value={form.deliverySlots.join(", ")}
              onChange={(e) => setForm({ ...form, deliverySlots: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
            />
          </CardBody>
        </Card>
      </div>

      {/* Admin users */}
      <Card className="mt-4">
        <CardBody>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">Admin users</p>
            <Button size="sm" variant="outline" onClick={() => setDraft({ id: "", name: "", email: "", password: "", role: "support", active: true })}>
              <Plus size={15} /> Add
            </Button>
          </div>
          <div className="divide-y divide-border">
            {admins.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-2 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{a.name} {a.id === admin?.id && <span className="text-xs text-muted">(you)</span>}</p>
                  <p className="truncate text-xs text-muted">{a.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="neutral" size="sm">{roleLabel[a.role]}</Badge>
                  {!a.active && <Badge variant="surface" size="sm">Disabled</Badge>}
                  <button aria-label="Edit" className="text-xs font-semibold text-primary hover:underline" onClick={() => setDraft({ ...a })}>Edit</button>
                  {a.id !== admin?.id && (
                    <button aria-label="Remove" className="text-muted hover:text-danger" onClick={() => { if (confirm(`Remove ${a.name}?`)) { adminStore.removeAdmin(a.id); refresh(); } }}><Trash2 size={15} /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <BottomSheet open={!!draft} onClose={() => setDraft(null)} title={draft?.id ? "Edit admin" : "Add admin"}>
        {draft && (
          <div className="space-y-3">
            <Input label="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            <Input label="Email" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
            <Input label="Password" value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} />
            <Select label="Role" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as AdminRole })}>
              {ROLES.map((r) => <option key={r} value={r}>{roleLabel[r]}</option>)}
            </Select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} /> Active
            </label>
            <Button fullWidth disabled={!draft.name.trim() || !draft.email.trim() || !draft.password.trim()} onClick={() => { adminStore.saveAdmin(draft); setDraft(null); refresh(); }}>
              Save admin
            </Button>
          </div>
        )}
      </BottomSheet>
    </>
  );
}
