"use client";

import { useMemo, useState } from "react";
import { Button, Card, CardBody, Chip, Input, PageLoader } from "@/components/ui";
import { PageHeader, StatusPill } from "@/components/admin/bits";
import { useAdmin } from "@/lib/admin/useAdmin";
import { useAdminAuth } from "@/lib/admin/AdminAuthProvider";
import { adminStore } from "@/lib/admin/store";
import { shortDate } from "@/lib/format";
import { cn } from "@/lib/cn";

type Filter = "all" | "open" | "resolved";

export default function SupportPage() {
  const { hydrated, tick, refresh } = useAdmin();
  const { admin } = useAdminAuth();
  const [filter, setFilter] = useState<Filter>("open");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  const tickets = useMemo(() => {
    if (!hydrated) return [];
    return adminStore.tickets().filter((t) => (filter === "all" ? true : t.status === filter));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tick re-reads the store after mutations
  }, [hydrated, tick, filter]);

  const selected = useMemo(
    () => (hydrated && selectedId ? adminStore.ticket(selectedId) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tick re-reads the store after mutations
    [hydrated, selectedId, tick],
  );

  if (!hydrated) return <PageLoader />;
  const openCount = adminStore.tickets().filter((t) => t.status === "open").length;

  function sendReply() {
    if (!selected || !reply.trim()) return;
    adminStore.replyTicket(selected.id, admin?.name ?? "Support", reply.trim());
    setReply("");
    refresh();
  }

  return (
    <>
      <PageHeader title="Support" subtitle={`${openCount} open tickets`} />

      <div className="mb-4 flex flex-wrap gap-2">
        {(["open", "resolved", "all"] as Filter[]).map((f) => (
          <Chip key={f} selected={filter === f} onClick={() => setFilter(f)}>{f[0].toUpperCase() + f.slice(1)}</Chip>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        {/* Inbox */}
        <Card>
          <div className="divide-y divide-border">
            {tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={cn(
                  "flex w-full flex-col gap-1 p-4 text-left transition-colors hover:bg-primary-light/50",
                  selectedId === t.id && "bg-primary-light",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-semibold">{t.subject}</span>
                  <StatusPill status={t.status} />
                </div>
                <span className="text-xs text-muted">{t.customerName} · {shortDate(t.createdAt)}</span>
              </button>
            ))}
            {tickets.length === 0 && <p className="p-6 text-center text-sm text-muted">No tickets.</p>}
          </div>
        </Card>

        {/* Thread */}
        <Card>
          <CardBody>
            {!selected ? (
              <p className="py-16 text-center text-sm text-muted">Select a ticket to view the conversation.</p>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold">{selected.subject}</p>
                    <p className="text-xs text-muted">{selected.customerName}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => { adminStore.setTicketStatus(selected.id, selected.status === "open" ? "resolved" : "open"); refresh(); }}>
                    {selected.status === "open" ? "Mark resolved" : "Reopen"}
                  </Button>
                </div>

                <div className="my-4 space-y-3">
                  {selected.messages.map((m, i) => (
                    <div key={i} className={cn("max-w-[85%] rounded-lg px-3 py-2 text-sm", m.from === "admin" ? "ml-auto bg-primary text-primary-light" : "bg-primary-light text-primary")}>
                      <p className="mb-0.5 text-[11px] font-semibold opacity-80">{m.author}</p>
                      {m.message}
                    </div>
                  ))}
                </div>

                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Input placeholder="Type a reply…" value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); sendReply(); } }} />
                  </div>
                  <Button disabled={!reply.trim()} onClick={sendReply}>Send</Button>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
