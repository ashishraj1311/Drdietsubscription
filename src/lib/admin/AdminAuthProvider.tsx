"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { adminStore } from "./store";
import type { AdminRole, AdminUser } from "./types";

const SESSION_KEY = "drdiet.admin.session";

interface AdminAuthValue {
  admin: AdminUser | null;
  hydrated: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  can: (roles: AdminRole[]) => boolean;
}

const Ctx = createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Re-validate the stored session against the seeded admin list.
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const id = localStorage.getItem(SESSION_KEY);
      if (id) setAdmin(adminStore.admins().find((a) => a.id === id && a.active) ?? null);
    } catch {}
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const login = useCallback((email: string, password: string) => {
    const found = adminStore.findAdmin(email, password);
    if (!found) return { ok: false, error: "Invalid email or password." };
    localStorage.setItem(SESSION_KEY, found.id);
    setAdmin(found);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setAdmin(null);
  }, []);

  const can = useCallback(
    (roles: AdminRole[]) => !!admin && (admin.role === "super_admin" || roles.includes(admin.role)),
    [admin],
  );

  const value = useMemo(
    () => ({ admin, hydrated, login, logout, can }),
    [admin, hydrated, login, logout, can],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return c;
}
