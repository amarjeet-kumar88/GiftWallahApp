// app/admin/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import Link from "next/link";
import {
  PackageSearch,
  ArrowRight,
  Loader2,
} from "lucide-react";
import type { Order } from "@/lib/types";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDateTime = (value?: string) => {
  if (!value) return "";
  const d = new Date(value);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Backend se admin orders me user populated aayega
type AdminOrder = Order & {
  user?: {
    name?: string;
    email?: string;
    phone?: string;
  };
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [paymentUpdatingId, setPaymentUpdatingId] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await apiClient.get("/admin/orders");
      console.log("Admin orders:", res.data);

      const root = res.data;
      const payload = root?.data ?? root;
      const list = payload?.orders ?? payload;

      const arr: AdminOrder[] = Array.isArray(list) ? list : [];
      setOrders(arr);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "Failed to load orders. Please try again."
      );
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!newStatus) return;
    try {
      setStatusUpdatingId(orderId);
      const res = await apiClient.patch(`/admin/orders/${orderId}/status`, {
        status: newStatus,
      });

      const root = res.data;
      const payload = root?.data ?? root;
      const updated: AdminOrder = payload?.order ?? payload;

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? updated : o))
      );
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "Failed to update order status."
      );
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handlePaymentStatusChange = async (
    orderId: string,
    newPaymentStatus: string
  ) => {
    if (!newPaymentStatus) return;
    try {
      setPaymentUpdatingId(orderId);
      const res = await apiClient.patch(
        `/admin/orders/${orderId}/payment-status`,
        {
          paymentStatus: newPaymentStatus,
        }
      );

      const root = res.data;
      const payload = root?.data ?? root;
      const updated: AdminOrder = payload?.order ?? payload;

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? updated : o))
      );
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "Failed to update payment status."
      );
    } finally {
      setPaymentUpdatingId(null);
    }
  };

  // Filter orders by status
  const filteredOrders = orders.filter((o) => {
    if (statusFilter === "ALL") return true;
    const s = String((o as any).status || "").toUpperCase();
    return s === statusFilter;
  });

  // ---------------- UI ----------------

  if (isLoading) {
    return (
      <section className="flex min-h-[40vh] items-center justify-center">
        <div className="flex items-center gap-2 rounded-md bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading orders...
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

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-sm font-semibold text-slate-900 md:text-base">
            <PackageSearch className="h-4 w-4 text-brand-primary" />
            Orders
          </h1>
          <p className="text-[11px] text-slate-500 md:text-xs">
            View and manage all customer orders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
          <span className="text-[11px] text-slate-500 md:text-xs">
            Filter by status:
          </span>
          <select
            className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] outline-none focus:border-blue-500 md:text-xs"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500 md:text-sm">
          No orders found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-50 text-[11px] text-slate-500 md:text-xs">
                <th className="border-b border-slate-200 px-2 py-2 text-left">
                  Order
                </th>
                <th className="border-b border-slate-200 px-2 py-2 text-left">
                  Customer
                </th>
                <th className="border-b border-slate-200 px-2 py-2 text-left">
                  Amount
                </th>
                <th className="border-b border-slate-200 px-2 py-2 text-left">
                  Status
                </th>
                <th className="border-b border-slate-200 px-2 py-2 text-left">
                  Payment
                </th>
                <th className="border-b border-slate-200 px-2 py-2 text-left">
                  Items
                </th>
                <th className="border-b border-slate-200 px-2 py-2 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => {
                const status = (o as any).status || "—";
                const paymentStatus =
                  (o as any).paymentStatus || "—";
                const itemsCount = o.items?.reduce(
                  (sum: number, it: any) => sum + (it.quantity || 0),
                  0
                );

                return (
                  <tr
                    key={o._id}
                    className="border-b border-slate-100 text-slate-700"
                  >
                    <td className="px-2 py-2 align-top">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-900">
                          #{o._id.slice(-8)}
                        </p>
                        <p className="text-[11px] text-slate-500 md:text-xs">
                          {formatDateTime((o as any).createdAt)}
                        </p>
                      </div>
                    </td>

                    <td className="px-2 py-2 align-top">
                      {o.user ? (
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-semibold text-slate-900 md:text-xs">
                            {o.user.name || "—"}
                          </p>
                          {o.user.email && (
                            <p className="text-[11px] text-slate-500 md:text-xs">
                              {o.user.email}
                            </p>
                          )}
                          {o.user.phone && (
                            <p className="text-[11px] text-slate-500 md:text-xs">
                              {o.user.phone}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 md:text-xs">
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-2 py-2 align-top">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-900">
                          {formatPrice(o.amount)}
                        </p>
                        <p className="text-[11px] text-slate-500 md:text-xs">
                          {(o as any).currency || "INR"}
                        </p>
                      </div>
                    </td>

                    <td className="px-2 py-2 align-top">
                      <select
                        className="w-full rounded border border-slate-300 bg-white px-1.5 py-1 text-[11px] outline-none focus:border-blue-500 md:text-xs"
                        value={String(status).toUpperCase()}
                        onChange={(e) =>
                          handleStatusChange(o._id, e.target.value)
                        }
                        disabled={statusUpdatingId === o._id}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>

                    <td className="px-2 py-2 align-top">
                      <select
                        className="w-full rounded border border-slate-300 bg-white px-1.5 py-1 text-[11px] outline-none focus:border-blue-500 md:text-xs"
                        value={String(paymentStatus).toUpperCase()}
                        onChange={(e) =>
                          handlePaymentStatusChange(
                            o._id,
                            e.target.value
                          )
                        }
                        disabled={paymentUpdatingId === o._id}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PAID">Paid</option>
                        <option value="FAILED">Failed</option>
                        <option value="REFUNDED">Refunded</option>
                      </select>
                    </td>

                    <td className="px-2 py-2 align-top">
                      <p className="text-[11px] text-slate-700 md:text-xs">
                        {itemsCount} item
                        {itemsCount && itemsCount > 1 ? "s" : ""}
                      </p>
                    </td>

                    <td className="px-2 py-2 align-top text-right">
                      <Link
                        href={`/orders/${o._id}`}
                        className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-[11px] text-brand-primary hover:bg-blue-50 md:text-xs"
                      >
                        <span>View</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
