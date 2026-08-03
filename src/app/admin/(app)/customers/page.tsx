"use client";

import { useMemo, useState } from "react";
import { Chip, Input, PageLoader } from "@/components/ui";
import { Column, DataTable, PageHeader, StatusPill } from "@/components/admin/bits";
import { useAdmin } from "@/lib/admin/useAdmin";
import { adminStore } from "@/lib/admin/store";
import { dietLabel, goalLabel, shortDate } from "@/lib/format";
import type { AdminCustomer } from "@/lib/admin/types";
import type { DietPreference } from "@/lib/types";

const DIETS: DietPreference[] = ["veg", "non_veg", "vegan", "eggetarian"];

export default function CustomersPage() {
  const { hydrated, tick } = useAdmin();
  const [q, setQ] = useState("");
  const [diet, setDiet] = useState<DietPreference | null>(null);
  const [status, setStatus] = useState<"all" | "active" | "suspended">("all");

  const rows = useMemo(() => {
    if (!hydrated) return [];
    const term = q.trim().toLowerCase();
    return adminStore.customers().filter((c) => {
      if (diet && c.diet !== diet) return false;
      if (status !== "all" && c.status !== status) return false;
      if (term && !`${c.name} ${c.email} ${c.city}`.toLowerCase().includes(term)) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tick re-reads the store after mutations
  }, [hydrated, tick, q, diet, status]);

  if (!hydrated) return <PageLoader />;

  const columns: Column<AdminCustomer>[] = [
    {
      header: "Customer",
      cell: (c) => (
        <div>
          <p className="font-semibold">{c.name}</p>
          <p className="text-xs text-muted">{c.email}</p>
        </div>
      ),
    },
    { header: "City", cell: (c) => c.city },
    { header: "Diet", cell: (c) => dietLabel(c.diet) },
    { header: "Goal", cell: (c) => goalLabel(c.goal) },
    { header: "Status", cell: (c) => <StatusPill status={c.status} /> },
    { header: "Joined", cell: (c) => <span className="text-muted">{shortDate(c.createdAt)}</span> },
  ];

  return (
    <>
      <PageHeader title="Customers" subtitle={`${adminStore.customers().length} total`} />

      <div className="mb-4 space-y-3">
        <Input placeholder="Search name, email or city…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          <Chip selected={diet === null} onClick={() => setDiet(null)}>All diets</Chip>
          {DIETS.map((d) => (
            <Chip key={d} selected={diet === d} onClick={() => setDiet(d)}>{dietLabel(d)}</Chip>
          ))}
          <span className="mx-1 w-px self-stretch bg-border" />
          {(["all", "active", "suspended"] as const).map((s) => (
            <Chip key={s} selected={status === s} onClick={() => setStatus(s)}>
              {s === "all" ? "All" : s[0].toUpperCase() + s.slice(1)}
            </Chip>
          ))}
        </div>
      </div>

      <p className="mb-2 text-xs text-muted">{rows.length} shown</p>
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(c) => c.id}
        href={(c) => `/admin/customers/${c.id}`}
        empty="No customers match those filters."
      />
    </>
  );
}
