"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/ui";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAdminAuth } from "@/lib/admin/AdminAuthProvider";

// Guarded shell for every authenticated admin page.
export default function AdminAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { admin, hydrated } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !admin) router.replace("/admin/login");
  }, [hydrated, admin, router]);

  if (!hydrated || !admin) {
    return <PageLoader label="Loading admin…" />;
  }

  return <AdminShell>{children}</AdminShell>;
}
