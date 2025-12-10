"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import {
  IndianRupee,
  PackageSearch,
  ShoppingBag,
  Boxes,
  AlertTriangle,
  Users,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import type { Order, Product } from "@/lib/types";

type AdminOrder = Order & {
  user?: {
    name?: string;
    email?: string;
    phone?: string;
  };
};

type AdminProduct = Product & {
  stock?: number;
  isActive?: boolean;
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [ordersRes, productsRes] = await Promise.all([
        apiClient.get("/admin/orders"),
        apiClient.get("/admin/products"),
      ]);

      // normalize orders
      const oRoot = ordersRes.data;
      const oPayload = oRoot?.data ?? oRoot;
      const oList = oPayload?.orders ?? oPayload;
      const ordersArr: AdminOrder[] = Array.isArray(oList) ? oList : [];

      // normalize products
      const pRoot = productsRes.data;
      const pPayload = pRoot?.data ?? pRoot;
      const pList = pPayload?.products ?? pPayload;
      const productsArr: AdminProduct[] = Array.isArray(pList) ? pList : [];

      setOrders(ordersArr);
      setProducts(productsArr);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "Failed to load admin overview. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ------------ Stats compute ------------

  const totalOrders = orders.length;

  const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);

  const today = new Date();
  const todayRevenue = orders.reduce((sum, o) => {
    const d = new Date((o as any).createdAt || "");
    if (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    ) {
      return sum + (o.amount || 0);
    }
    return sum;
  }, 0);

  const paidOrders = orders.filter(
    (o: any) =>
      String(o.paymentStatus || o.status || "")
        .toUpperCase()
        .includes("PAID") ||
      String(o.status || "").toUpperCase() === "CONFIRMED" ||
      String(o.status || "").toUpperCase() === "DELIVERED"
  ).length;

  const cancelledOrders = orders.filter(
    (o: any) =>
      String(o.status || "").toUpperCase() === "CANCELLED"
  ).length;

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => !!p.isActive).length;
  const inactiveProducts = totalProducts - activeProducts;

  const lowStockProducts = products.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) < 5).length;
  const outOfStockProducts = products.filter((p) => (p.stock ?? 0) === 0).length;

  const uniqueCustomers = new Set(
    orders
      .map((o: any) => o.user?._id || o.user || "")
      .filter(Boolean)
  ).size;

  // ------------ UI ------------

  if (isLoading) {
    return (
      <section className="flex min-h-[40vh] items-center justify-center">
        <div className="flex items-center gap-2 rounded-md bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading dashboard...
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
            onClick={fetchData}
            className="mt-3 inline-block rounded bg-brand-primary px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-base font-semibold text-slate-900 md:text-lg">
            Admin Dashboard
          </h1>
          <p className="text-[11px] text-slate-500 md:text-xs">
            High-level overview of orders, revenue & inventory.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] md:text-xs">
          <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
            {uniqueCustomers || 0} unique customers
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
            {totalOrders} orders · {totalProducts} products
          </span>
        </div>
      </div>

      {/* Top stat cards */}
      <div className="grid gap-3 md:grid-cols-4">
        {/* Total revenue */}
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 md:text-xs">
                Total Revenue
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900 md:text-xl">
                {formatPrice(totalRevenue)}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
              <IndianRupee className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 md:text-xs">
            {paidOrders} paid orders · {cancelledOrders} cancelled
          </p>
        </div>

        {/* Today revenue */}
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 md:text-xs">
                Today&apos;s Revenue
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900 md:text-xl">
                {formatPrice(todayRevenue)}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 md:text-xs">
            {orders.filter((o) => {
              const d = new Date((o as any).createdAt || "");
              return (
                d.getFullYear() === today.getFullYear() &&
                d.getMonth() === today.getMonth() &&
                d.getDate() === today.getDate()
              );
            }).length}{" "}
            orders placed today
          </p>
        </div>

        {/* Products */}
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 md:text-xs">
                Products
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900 md:text-xl">
                {totalProducts}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50">
              <Boxes className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 md:text-xs">
            {activeProducts} active · {inactiveProducts} inactive
          </p>
        </div>

        {/* Customers */}
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 md:text-xs">
                Customers
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900 md:text-xl">
                {uniqueCustomers || 0}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50">
              <Users className="h-5 w-5 text-orange-500" />
            </div>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 md:text-xs">
            Based on unique users with orders
          </p>
        </div>
      </div>

      {/* Bottom 2 panels: Orders snapshot + Inventory health */}
      <div className="grid gap-3 md:grid-cols-2">
        {/* Recent orders */}
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PackageSearch className="h-4 w-4 text-brand-primary" />
              <h2 className="text-xs font-semibold text-slate-900 md:text-sm">
                Recent Orders
              </h2>
            </div>
            <Link
              href="/admin/orders"
              className="text-[11px] font-semibold text-brand-primary hover:text-blue-700 md:text-xs"
            >
              View all
            </Link>
          </div>

          {orders.length === 0 ? (
            <p className="text-[11px] text-slate-500 md:text-xs">
              No orders yet.
            </p>
          ) : (
            <div className="space-y-2">
              {orders.slice(0, 5).map((o) => {
                const status = (o as any).status || (o as any).paymentStatus;
                const totalItems = (o.items as any[])?.reduce(
                  (sum, it: any) => sum + (it.quantity || 0),
                  0
                );

                return (
                  <div
                    key={o._id}
                    className="flex items-center justify-between rounded border border-slate-100 px-2 py-2 text-[11px] md:text-xs"
                  >
                    <div className="flex flex-1 flex-col">
                      <span className="font-semibold text-slate-900">
                        #{o._id.slice(-8)}
                      </span>
                      <span className="text-slate-500">
                        {totalItems} items • {formatPrice(o.amount)}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] text-slate-500 md:text-[11px]">
                        {new Date(
                          (o as any).createdAt || ""
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 md:text-[11px]">
                        {status || "PAID"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Inventory health */}
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <h2 className="text-xs font-semibold text-slate-900 md:text-sm">
                Inventory Health
              </h2>
            </div>
            <Link
              href="/admin/products"
              className="text-[11px] font-semibold text-brand-primary hover:text-blue-700 md:text-xs"
            >
              Manage products
            </Link>
          </div>

          <div className="space-y-2 text-[11px] text-slate-700 md:text-xs">
            <p>
              <span className="font-semibold text-emerald-700">
                {activeProducts}
              </span>{" "}
              active products,{" "}
              <span className="font-semibold text-slate-700">
                {inactiveProducts}
              </span>{" "}
              hidden.
            </p>
            <p>
              <span className="font-semibold text-orange-600">
                {lowStockProducts}
              </span>{" "}
              items low stock (1–4),{" "}
              <span className="font-semibold text-red-600">
                {outOfStockProducts}
              </span>{" "}
              out of stock.
            </p>
          </div>

          {lowStockProducts > 0 && (
            <div className="mt-2 rounded-md bg-orange-50 p-2 text-[11px] text-orange-700 md:text-xs">
              Some products are running low. Consider updating stock.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
