// app/admin/analytics/page.tsx
"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import type { Order } from "@/lib/types";
import { IndianRupee, BarChart2, Loader2 } from "lucide-react";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

type MonthBucket = {
  label: string; // "Dec 2025"
  key: string;   // "2025-12"
  revenue: number;
  orders: number;
};

export default function AdminAnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await apiClient.get("/admin/orders");
      const root = res.data;
      const payload = root?.data ?? root;
      const list = payload?.orders ?? payload;
      setOrders(Array.isArray(list) ? list : []);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "Failed to load analytics."
      );
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Last 6 months buckets
  const now = new Date();
  const months: MonthBucket[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-IN", {
      month: "short",
      year: "2-digit",
    });
    months.push({ key, label, revenue: 0, orders: 0 });
  }

  orders.forEach((o) => {
    const d = new Date((o as any).createdAt || "");
    if (isNaN(d.getTime())) return;

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    const bucket = months.find((m) => m.key === key);
    if (bucket) {
      bucket.revenue += o.amount || 0;
      bucket.orders += 1;
    }
  });

  const maxRevenue = Math.max(...months.map((m) => m.revenue), 1);

  if (isLoading) {
    return (
      <section className="flex min-h-[40vh] items-center justify-center">
        <div className="flex items-center gap-2 rounded-md bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading analytics...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex min-h-[40vh] items-center justify-center">
        <div className="max-w-sm rounded-md bg-white p-4 text-center shadow-sm">
          <p className="text-sm text-slate-700">{error}</p>
          <button
            onClick={fetchOrders}
            className="mt-3 inline-block rounded bg-brand-primary px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  const totalRevenue = months.reduce((sum, m) => sum + m.revenue, 0);
  const totalOrders = months.reduce((sum, m) => sum + m.orders, 0);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-sm font-semibold text-slate-900 md:text-base">
            <BarChart2 className="h-4 w-4 text-brand-primary" />
            Analytics (Last 6 months)
          </h1>
          <p className="text-[11px] text-slate-500 md:text-xs">
            Month-wise revenue & order trends based on paid/confirmed orders.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
          <p className="text-[11px] font-semibold text-slate-500 md:text-xs">
            Total Revenue (6M)
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-900 md:text-xl">
            {formatPrice(totalRevenue)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
          <p className="text-[11px] font-semibold text-slate-500 md:text-xs">
            Total Orders (6M)
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-900 md:text-xl">
            {totalOrders}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
          <p className="text-[11px] font-semibold text-slate-500 md:text-xs">
            Avg order value
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-900 md:text-xl">
            {totalOrders
              ? formatPrice(Math.round(totalRevenue / totalOrders))
              : formatPrice(0)}
          </p>
        </div>
      </div>

      {/* Simple bar chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-emerald-500" />
            <h2 className="text-xs font-semibold text-slate-900 md:text-sm">
              Revenue by month
            </h2>
          </div>
        </div>

        <div className="flex items-end gap-3 overflow-x-auto py-3">
          {months.map((m) => {
            const height = (m.revenue / maxRevenue) * 100; // %
            return (
              <div
                key={m.key}
                className="flex flex-1 min-w-[60px] flex-col items-center gap-1"
              >
                <div className="flex h-32 w-full items-end justify-center rounded bg-slate-50">
                  <div
                    className="flex w-7 justify-center rounded-t bg-emerald-500 text-[10px] font-semibold text-white"
                    style={{ height: `${Math.max(height, 4)}%` }}
                  >
                    <span className="self-start px-0.5">
                      {m.revenue > 0
                        ? Math.round(m.revenue / 1000) + "k"
                        : ""}
                    </span>
                  </div>
                </div>
                <div className="text-center text-[10px] text-slate-600 md:text-[11px]">
                  <div>{m.label}</div>
                  <div>{m.orders} orders</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
