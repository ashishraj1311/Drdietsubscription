"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/providers";
import { api } from "@/lib/mock/api";
import type { Invoice, Order, Subscription } from "@/lib/types";

export interface DashboardData {
  loading: boolean;
  hasAccount: boolean;
  subscription: Subscription | null;
  orders: Order[];
  invoices: Invoice[];
  refresh: () => void;
}

/** Loads the logged-in user's active subscription + orders + invoices. */
export function useDashboardData(): DashboardData {
  const { user, hydrated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const load = useCallback(() => {
    if (!user) {
      setSubscription(null);
      setOrders([]);
      setInvoices([]);
      setLoading(false);
      return;
    }
    const sub = api.getActiveSubscription(user.id);
    setSubscription(sub);
    setOrders(sub ? api.getOrders(sub.id) : []);
    setInvoices(api.getInvoices(user.id));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!hydrated) return;
    // Intentional: sync client-only external store (localStorage) into state
    // once the auth provider has hydrated.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [hydrated, load]);

  return {
    loading: !hydrated || loading,
    hasAccount: !!user,
    subscription,
    orders,
    invoices,
    refresh: load,
  };
}
