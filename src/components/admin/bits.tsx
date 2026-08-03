import Link from "next/link";
import { cn } from "@/lib/cn";
import { Card, CardBody } from "@/components/ui";
import { inr } from "@/lib/format";

/** KPI stat tile. */
export function StatTile({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <Card>
      <CardBody className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted">{label}</p>
          <p className="mt-1 text-2xl font-bold text-primary">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
        </div>
        {icon && (
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
              accent ? "bg-accent/40 text-primary" : "bg-primary-light text-primary",
            )}
            aria-hidden
          >
            {icon}
          </span>
        )}
      </CardBody>
    </Card>
  );
}

/** Page title + optional actions row. */
export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-primary">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

type Tone = "active" | "paused" | "cancelled" | "success" | "failed" | "refunded" | "open" | "resolved" | "upcoming" | "delivered" | "skipped" | "suspended";

const TONE_CLASS: Record<Tone, string> = {
  active: "bg-success/15 text-success",
  delivered: "bg-success/15 text-success",
  success: "bg-success/15 text-success",
  resolved: "bg-success/15 text-success",
  paused: "bg-neutral/20 text-muted",
  upcoming: "bg-primary-light text-primary",
  skipped: "bg-neutral/20 text-muted",
  suspended: "bg-danger/12 text-danger",
  cancelled: "bg-danger/12 text-danger",
  failed: "bg-danger/12 text-danger",
  refunded: "bg-neutral/20 text-muted",
  open: "bg-accent/40 text-primary",
};

export function StatusPill({ status }: { status: string }) {
  const cls = TONE_CLASS[status as Tone] ?? "bg-neutral/20 text-muted";
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize", cls)}>
      {status}
    </span>
  );
}

/** Generic data table. */
export type Column<T> = {
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  href,
  empty = "Nothing to show.",
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  href?: (row: T) => string;
  empty?: string;
}) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardBody className="py-10 text-center text-sm text-muted">{empty}</CardBody>
      </Card>
    );
  }
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {columns.map((c) => (
                <th key={c.header} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const content = columns.map((c, ci) => (
                <td key={ci} className={cn("px-4 py-3 align-middle text-primary", c.className)}>
                  {c.cell(row)}
                </td>
              ));
              return href ? (
                <tr key={rowKey(row)} className="group border-b border-border last:border-0 hover:bg-primary-light/50">
                  <td className="p-0" colSpan={columns.length}>
                    <Link href={href(row)} className="contents">
                      <table className="w-full border-collapse">
                        <tbody>
                          <tr>{content}</tr>
                        </tbody>
                      </table>
                    </Link>
                  </td>
                </tr>
              ) : (
                <tr key={rowKey(row)} className="border-b border-border last:border-0 hover:bg-primary-light/40">
                  {content}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/** Simple vertical bar chart for the dashboard (INR by month). */
export function MiniBarChart({ data }: { data: { month: string; inr: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.inr));
  return (
    <div className="flex h-44 items-end gap-3">
      {data.map((d) => (
        <div key={d.month} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="text-[10px] text-muted">{d.inr > 0 ? inr(d.inr) : ""}</span>
          <div
            className="w-full rounded-t-md bg-primary transition-all"
            style={{ height: `${(d.inr / max) * 100}%`, minHeight: 2 }}
          />
          <span className="text-[11px] text-muted">{d.month}</span>
        </div>
      ))}
    </div>
  );
}
