import { AdminAuthProvider } from "@/lib/admin/AdminAuthProvider";

// All /admin/* routes share the admin auth context. The login page renders
// bare; the (app) route group adds the sidebar shell + route guard.
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
