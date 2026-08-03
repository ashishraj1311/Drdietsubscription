"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  Menu as MenuIcon,
  Package,
  RotateCcw,
  Settings,
  Star,
  Ticket,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui";
import { useAdminAuth } from "@/lib/admin/AdminAuthProvider";
import { adminStore } from "@/lib/admin/store";
import { cn } from "@/lib/cn";
import type { AdminRole } from "@/lib/admin/types";

const NAV: { href: string; label: string; Icon: typeof Users; roles: AdminRole[] }[] = [
  { href: "/admin", label: "Overview", Icon: LayoutDashboard, roles: ["super_admin", "ops", "support"] },
  { href: "/admin/customers", label: "Customers", Icon: Users, roles: ["super_admin", "support"] },
  { href: "/admin/subscriptions", label: "Subscriptions", Icon: CreditCard, roles: ["super_admin", "ops", "support"] },
  { href: "/admin/orders", label: "Orders & Kitchen", Icon: Package, roles: ["super_admin", "ops"] },
  { href: "/admin/menu", label: "Menu & Plans", Icon: UtensilsCrossed, roles: ["super_admin", "ops"] },
  { href: "/admin/coupons", label: "Coupons", Icon: Ticket, roles: ["super_admin"] },
  { href: "/admin/payments", label: "Payments", Icon: CreditCard, roles: ["super_admin"] },
  { href: "/admin/reviews", label: "Reviews", Icon: Star, roles: ["super_admin", "support"] },
  { href: "/admin/support", label: "Support", Icon: LifeBuoy, roles: ["super_admin", "support"] },
  { href: "/admin/settings", label: "Settings", Icon: Settings, roles: ["super_admin"] },
];

const ROLE_LABEL: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  ops: "Kitchen / Ops",
  support: "Support",
};

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { admin, logout, can } = useAdminAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = NAV.filter((n) => can(n.roles));
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const nav = (
    <nav className="flex flex-col gap-1 p-3">
      {items.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            isActive(href)
              ? "bg-primary text-primary-light"
              : "text-muted hover:bg-primary-light hover:text-primary",
          )}
        >
          <Icon size={18} aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-full bg-bg">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-border bg-surface md:flex">
        <div className="flex h-16 items-center border-b border-border px-4">
          <Link href="/admin" aria-label="Dr Diet admin">
            <Logo variant="full" className="text-base" />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto">{nav}</div>
        <div className="border-t border-border p-3 text-xs text-muted">
          <button
            onClick={() => {
              if (confirm("Reset all demo data to the seeded state?")) {
                adminStore.resetDemo();
                location.reload();
              }
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 hover:bg-primary-light hover:text-primary"
          >
            <RotateCcw size={15} /> Reset demo data
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button className="absolute inset-0 bg-primary/40" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-surface shadow-[var(--shadow-sheet)]">
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <Logo variant="full" className="text-base" />
              <button aria-label="Close" onClick={() => setOpen(false)}>
                <X size={20} />
              </button>
            </div>
            {nav}
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="md:pl-60">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-bg/90 px-4 backdrop-blur sm:px-6">
          <button className="md:hidden text-primary" aria-label="Open menu" onClick={() => setOpen(true)}>
            <MenuIcon size={22} />
          </button>
          <span className="hidden text-sm font-semibold text-primary md:block">Admin Console</span>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold leading-tight text-primary">{admin?.name}</p>
              <p className="text-[11px] text-muted">{admin ? ROLE_LABEL[admin.role] : ""}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/50 text-sm font-bold text-primary">
              {admin?.name?.charAt(0) ?? "A"}
            </div>
            <button onClick={logout} className="text-sm text-muted hover:text-danger">
              Sign out
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
