"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Logo } from "@/components/ui";
import { useAuth } from "@/lib/providers";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/dashboard/orders", label: "Orders", icon: "📦" },
  { href: "/dashboard/progress", label: "Progress", icon: "📈" },
  { href: "/dashboard/invoices", label: "Invoices", icon: "🧾" },
  { href: "/dashboard/profile", label: "Profile", icon: "👤" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, hydrated, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (hydrated && !user) router.replace("/auth?redirect=/dashboard");
  }, [hydrated, user, router]);

  return (
    <div className="flex min-h-full flex-col pb-16 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="Dr Diet home">
            <Logo variant="full" className="text-lg" />
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            {TABS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === t.href ? "text-primary" : "text-muted",
                )}
              >
                {t.label}
              </Link>
            ))}
          </nav>
          <button
            onClick={signOut}
            className="text-sm text-muted hover:text-danger"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6">
        {children}
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-surface md:hidden">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "flex flex-col items-center gap-0.5 py-2 text-[11px]",
              pathname === t.href ? "text-primary" : "text-muted",
            )}
          >
            <span aria-hidden className="text-base">
              {t.icon}
            </span>
            {t.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
