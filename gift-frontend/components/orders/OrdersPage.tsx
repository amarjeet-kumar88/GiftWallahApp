"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import { Order } from "@/lib/types";
import Link from "next/link";
import { Package, Clock3 } from "lucide-react";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value?: string) => {
  if (!value) return "";
  const d = new Date(value);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function OrdersPageClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await apiClient.get("/orders");
      console.log("Orders API response:", res.data);

      const root = res.data;
      const payload = root?.data ?? root;
      const list = payload?.orders ?? payload;

      const arr: Order[] = Array.isArray(list) ? list : [];
      setOrders(arr);
    } catch (err: any) {
      console.error(err);
      if (err?.response?.status === 401) {
        setError("Please login to view your orders.");
      } else {
        setError(
          err?.response?.data?.message ||
            "Failed to load orders. Please try again."
        );
      }
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="rounded-md bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
          Loading your orders...
        </p>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="max-w-sm rounded-md bg-white p-4 text-center shadow-sm">
          <p className="text-sm text-slate-700">{error}</p>
          {error.toLowerCase().includes("login") && (
            <Link
              href="/auth/login-otp"
              className="mt-3 inline-block rounded bg-brand-primary px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Login to Continue
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="max-w-sm rounded-md bg-white p-4 text-center shadow-sm">
          <Package className="mx-auto mb-2 h-8 w-8 text-slate-400" />
          <p className="text-sm font-semibold text-slate-800">
            You have no orders yet
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Place your first order and it will appear here.
          </p>
          <Link
            href="/products"
            className="mt-3 inline-block rounded bg-brand-primary px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-3 rounded-md bg-white p-3 shadow-sm md:p-4">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-sm font-semibold text-slate-800 md:text-base">
          <Package className="h-4 w-4 text-brand-primary" />
          My Orders
        </h1>
        <p className="text-[11px] text-slate-500 md:text-xs">
          {orders.length} order{orders.length > 1 ? "s" : ""} placed
        </p>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <div
            key={order._id}
            className="rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-700 shadow-sm md:p-4 md:text-sm"
          >
            {/* Header row */}
            <div className="flex flex-col gap-2 border-b border-slate-100 pb-2 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 md:text-xs">
                    ORDER PLACED
                  </p>
                  <p className="text-xs font-medium text-slate-800 md:text-sm">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 md:text-xs">
                    TOTAL
                  </p>
                  <p className="text-xs font-medium text-slate-800 md:text-sm">
                    {formatPrice(order.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 md:text-xs">
                    STATUS
                  </p>
                  <p className="text-xs font-medium text-green-700 md:text-sm">
                    {order.status || order.paymentStatus || "Paid"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-500 md:text-xs">
                <Clock3 className="h-3.5 w-3.5" />
                <span>Order ID: {order._id}</span>
              </div>
            </div>

            {/* Items preview */}
            <div className="mt-2 space-y-2">
              {order.items.slice(0, 3).map((item, idx) => {
                const name = item.name;
                const image =
                  item.image ||
                  (typeof item.product === "object" &&
                    (item.product as any)?.images?.[0]?.url) ||
                  "https://via.placeholder.com/80x80.png?text=No+Image";

                return (
                  <div
                    key={`${order._id}-${idx}`}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded bg-slate-50 md:h-14 md:w-14">
                      <img
                        src={image}
                        alt={name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="line-clamp-2 text-[11px] font-medium text-slate-900 md:text-xs">
                        {name}
                      </p>
                      <p className="text-[10px] text-slate-500 md:text-[11px]">
                        Qty: {item.quantity} • {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                );
              })}

              {order.items.length > 3 && (
                <p className="text-[10px] text-slate-500 md:text-[11px]">
                  + {order.items.length - 3} more item
                  {order.items.length - 3 > 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* View details link */}
            <div className="mt-3 flex justify-end">
              <Link
                href={`/orders/${order._id}`}
                className="text-[11px] font-semibold text-brand-primary hover:text-blue-700 md:text-xs"
              >
                View order details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
