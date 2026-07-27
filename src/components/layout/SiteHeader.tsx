"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button, Logo } from "@/components/ui";
import { useAuth } from "@/lib/providers";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/explore", label: "Explore" },
  { href: "/menu", label: "This Week's Menu" },
  { href: "/compare", label: "Compare" },
  { href: "/reviews", label: "Reviews" },
  { href: "/faqs", label: "FAQs" },
];

export function SiteHeader() {
  const { user, isLoggedIn } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="Dr Diet home">
          <Logo variant="full" className="text-lg" />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === n.href ? "text-primary" : "text-muted",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button size="sm" variant="outline">
                {user?.name?.split(" ")[0] || "Dashboard"}
              </Button>
            </Link>
          ) : (
            <Link href="/auth" className="hidden sm:block">
              <Button size="sm" variant="ghost">
                Log in
              </Button>
            </Link>
          )}
          <Link href="/build">
            <Button size="sm">Build my plan</Button>
          </Link>
          <button
            className="md:hidden text-primary"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-surface px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm font-medium text-primary hover:bg-primary/5"
              >
                {n.label}
              </Link>
            ))}
            {!isLoggedIn && (
              <Link
                href="/auth"
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm font-medium text-primary hover:bg-primary/5"
              >
                Log in
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
