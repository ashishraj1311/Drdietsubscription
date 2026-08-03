"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Button, Card, CardBody, Input, Logo } from "@/components/ui";
import { useAdminAuth } from "@/lib/admin/AdminAuthProvider";

const DEMO = [
  ["admin@drdiet.in", "admin123", "Super Admin"],
  ["ops@drdiet.in", "ops123", "Kitchen / Ops"],
  ["support@drdiet.in", "support123", "Support"],
];

export default function AdminLoginPage() {
  const router = useRouter();
  const { admin, hydrated, login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Already signed in → go to console.
  useEffect(() => {
    if (hydrated && admin) router.replace("/admin");
  }, [hydrated, admin, router]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = login(email, password);
    if (res.ok) router.replace("/admin");
    else setError(res.error ?? "Login failed.");
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo variant="full" className="text-lg" />
          <div className="mt-4 flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck size={14} /> Admin Console
          </div>
        </div>

        <Card>
          <CardBody>
            <h1 className="text-xl font-bold">Sign in</h1>
            <p className="mt-1 text-sm text-muted">Staff access only.</p>
            <form onSubmit={submit} className="mt-4 space-y-3">
              <Input
                label="Email"
                type="email"
                autoComplete="username"
                placeholder="you@drdiet.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={error ?? undefined}
              />
              <Button type="submit" fullWidth disabled={!email || !password}>
                Sign in
              </Button>
            </form>
          </CardBody>
        </Card>

        {/* Demo credentials */}
        <div className="mt-4 rounded-lg border border-border bg-surface p-3">
          <p className="mb-2 text-xs font-semibold text-muted">Demo logins — tap to fill</p>
          <div className="space-y-1.5">
            {DEMO.map(([e, p, role]) => (
              <button
                key={e}
                onClick={() => {
                  setEmail(e);
                  setPassword(p);
                  setError(null);
                }}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs hover:bg-primary-light"
              >
                <span className="font-medium text-primary">{e}</span>
                <span className="text-muted">{role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
