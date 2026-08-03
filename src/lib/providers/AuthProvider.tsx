"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "@/lib/mock/api";
import type { User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  hydrated: boolean;
  isLoggedIn: boolean;
  isGuest: boolean;
  requestOtp: (phone: string) => Promise<{ devCode: string }>;
  verifyOtp: (phone: string, code: string) => Promise<User>;
  googleSignIn: () => Promise<User>;
  continueAsGuest: () => Promise<User>;
  updateUser: (patch: Partial<User>) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hydrate the session on mount (async: localStorage mock resolves instantly,
    // Supabase reads the real session). Also subscribe to auth changes so a
    // redirect-based sign-in (OAuth) updates the user when it completes.
    let active = true;
    api.getUser().then((u) => {
      if (!active) return;
      setUser(u);
      setHydrated(true);
    });
    const unsub = api.subscribeAuth?.((u) => {
      if (active) setUser(u);
    });
    return () => {
      active = false;
      unsub?.();
    };
  }, []);

  const requestOtp = useCallback((phone: string) => api.requestOtp(phone), []);

  const verifyOtp = useCallback(async (phone: string, code: string) => {
    const u = await api.verifyOtp(phone, code);
    setUser(u);
    return u;
  }, []);

  const googleSignIn = useCallback(async () => {
    const u = await api.googleSignIn();
    setUser(u);
    return u;
  }, []);

  const continueAsGuest = useCallback(async () => {
    const u = await api.continueAsGuest();
    setUser(u);
    return u;
  }, []);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      void api.saveUser(next);
      return next;
    });
  }, []);

  const signOut = useCallback(() => {
    void api.signOut();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      hydrated,
      isLoggedIn: !!user && user.auth_provider !== "guest",
      isGuest: user?.auth_provider === "guest",
      requestOtp,
      verifyOtp,
      googleSignIn,
      continueAsGuest,
      updateUser,
      signOut,
    }),
    [
      user,
      hydrated,
      requestOtp,
      verifyOtp,
      googleSignIn,
      continueAsGuest,
      updateUser,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
