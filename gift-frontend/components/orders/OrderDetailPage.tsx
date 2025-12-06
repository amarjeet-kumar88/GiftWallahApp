"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import { Order } from "@/lib/types";
import Link from "next/link";
import { Package, MapPin, CreditCard } from "lucide-react";

interface Props {
  orderId: string;
}

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

export default function OrderDetailPageClient({ orderId }: Props) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await apiClient.get(`/orders/${orderId}`);
      console.log("Order detail response:", res.data);

      const root = res.data;
      const payload = root?.data ?? root;
      const o = payload?.order ?? payload;

      setOrder(o || null);
    } catch (err: any) {
      console.error(err);
      if (err?.response?.status === 401) {
        setError("Please login to view this order.");
      } else if (err?.response?.status === 404) {
        setError("Order not found.");
      } else {
        setError(
          err?.response?.data?.message ||
            "Failed to load order. Please try again."
        );
      }
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="rounded-md bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
          Loading order details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="max-w-sm rounded-md bg-white p-4 text-center shadow-sm">
          <p className="text-sm text-slate-700">{error}</p>
          <Link
            href="/orders"
            className="mt-3 inline-block rounded bg-brand-primary px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const addr = order.address;
  const pay = order.payment;

  return (
    <section className="space-y-3 rounded-md bg-white p-3 shadow-sm md:p-4">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-sm font-semibold text-slate-800 md:text-base">
          <Package className="h-4 w-4 text-brand-primary" />
          Order Details
        </h1>
        <Link
          href="/orders"
          className="text-[11px] font-semibold text-brand-primary hover:text-blue-700 md:text-xs"
        >
          Back to Orders
        </Link>
      </div>

      {/* Summary */}
      <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 md:grid-cols-3 md:text-sm">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 md:text-xs">
            ORDER ID
          </p>
          <p className="break-all text-xs font-medium text-slate-800 md:text-sm">
            {order._id}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-500 md:text-xs">
            ORDER PLACED
          </p>
          <p className="text-xs font-medium text-slate-800 md:text-sm">
            {formatDateTime(order.createdAt)}
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

      {/* Address + payment */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-md border border-slate-200 p-3 text-xs text-slate-700 md:p-4 md:text-sm">
          <div className="mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand-primary" />
            <h2 className="text-xs font-semibold text-slate-800 md:text-sm">
              Delivery Address
            </h2>
          </div>
          {addr ? (
            <div className="space-y-1">
              <p className="font-semibold text-slate-900">
                {addr.fullName || addr.name}
              </p>
              <p>
                {addr.line1}
                {addr.line2 ? `, ${addr.line2}` : ""}
              </p>
              <p>
                {addr.city}, {addr.state} - {addr.pincode}
              </p>
              {addr.landmark && <p>Landmark: {addr.landmark}</p>}
              <p className="text-[11px] text-slate-500 md:text-xs">
                Phone: {addr.phone}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">No address information.</p>
          )}
        </div>

        <div className="rounded-md border border-slate-200 p-3 text-xs text-slate-700 md:p-4 md:text-sm">
          <div className="mb-2 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-orange-500" />
            <h2 className="text-xs font-semibold text-slate-800 md:text-sm">
              Payment Information
            </h2>
          </div>
          <div className="space-y-1">
            <p>
              <span className="font-semibold">Amount: </span>
              {formatPrice(order.amount)} ({order.currency || "INR"})
            </p>
            <p>
              <span className="font-semibold">Status: </span>
              {order.paymentStatus || "Paid"}
            </p>
            {pay && (
              <>
                <p className="break-all text-[11px] text-slate-500 md:text-xs">
                  Razorpay Order ID: {pay.razorpayOrderId}
                </p>
                <p className="break-all text-[11px] text-slate-500 md:text-xs">
                  Razorpay Payment ID: {pay.razorpayPaymentId}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="rounded-md border border-slate-200 p-3 text-xs text-slate-700 md:p-4 md:text-sm">
        <h2 className="mb-2 text-xs font-semibold text-slate-800 md:text-sm">
          Items in this order
        </h2>
        <div className="divide-y divide-slate-100">
          {order.items.map((item, idx) => {
            const image =
              item.image ||
              (typeof item.product === "object" &&
                (item.product as any)?.images?.[0]?.url) ||
              "https://via.placeholder.com/80x80.png?text=No+Image";

            return (
              <div
                key={`${order._id}-${idx}`}
                className="flex gap-3 py-2"
              >
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded bg-slate-50 md:h-16 md:w-16">
                  <img
                    src={image}
                    alt={item.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="flex-1">
                  <p className="line-clamp-2 text-[11px] font-medium text-slate-900 md:text-xs">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-slate-500 md:text-[11px]">
                    Qty: {item.quantity}
                  </p>
                  <p className="text-xs font-semibold text-slate-900 md:text-sm">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
