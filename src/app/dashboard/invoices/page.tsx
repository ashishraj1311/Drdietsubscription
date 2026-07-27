"use client";

import Link from "next/link";
import { Button, Card, CardBody } from "@/components/ui";
import { useDashboardData } from "@/lib/hooks/useDashboardData";
import { inr, longDate } from "@/lib/format";

export default function InvoicesPage() {
  const { loading, invoices } = useDashboardData();

  if (loading) return <p className="py-10 text-center text-sm text-muted">Loading…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Invoices</h1>
        <p className="text-sm text-muted">All amounts in ₹ (INR), GST included.</p>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface p-10 text-center">
          <p className="text-4xl" aria-hidden>🧾</p>
          <p className="mt-3 font-semibold">No invoices yet</p>
          <Link href="/build" className="mt-4 inline-block">
            <Button>Build a plan</Button>
          </Link>
        </div>
      ) : (
        <Card>
          <CardBody className="divide-y divide-border p-0">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between px-4 py-4">
                <div>
                  <p className="font-semibold">Invoice #{inv.id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-muted">
                    {longDate(inv.date)} · incl. GST {inr(inv.gstInr)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">{inr(inv.amountInr)}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      alert(
                        `Invoice ${inv.id}\nAmount: ${inr(inv.amountInr)}\nGST: ${inr(
                          inv.gstInr,
                        )}\n(Demo — PDF export not wired.)`,
                      )
                    }
                  >
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
