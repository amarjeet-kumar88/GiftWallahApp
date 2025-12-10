"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import { Order } from "@/lib/types";
import Link from "next/link";
import { Package, MapPin, CreditCard, XCircle, Edit3 } from "lucide-react";

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

type AddressForm = {
  fullName: string;
  phone: string;
  pincode: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  landmark: string;
};

const emptyAddress: AddressForm = {
  fullName: "",
  phone: "",
  pincode: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  landmark: "",
};

export default function OrderDetailPageClient({ orderId }: Props) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCancelling, setIsCancelling] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressForm>(emptyAddress);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await apiClient.get(`/orders/${orderId}`);
      console.log("Order detail response:", res.data);

      const root = res.data;
      const payload = root?.data ?? root;
      const o: Order = payload?.order ?? payload;

      setOrder(o || null);

      // prefill address form from order
      const addr: any = (payload?.order ?? payload)?.address;
      if (addr) {
        setAddressForm({
          fullName: addr.fullName || addr.name || "",
          phone: addr.phone || "",
          pincode: addr.pincode || "",
          line1: addr.line1 || "",
          line2: addr.line2 || "",
          city: addr.city || "",
          state: addr.state || "",
          landmark: addr.landmark || "",
        });
      } else {
        setAddressForm(emptyAddress);
      }
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

  const canCancel = (ord: Order | null) => {
    if (!ord) return false;
    const status = String((ord as any).status || "").toUpperCase();
    return status === "PENDING" || status === "CONFIRMED";
  };

  const canEditAddress = (ord: Order | null) => {
    if (!ord) return false;
    const status = String((ord as any).status || "").toUpperCase();
    return status === "PENDING" || status === "CONFIRMED";
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!canCancel(order)) {
      alert("This order cannot be cancelled now.");
      return;
    }
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      setIsCancelling(true);
      const res = await apiClient.post(`/orders/${orderId}/cancel`);
      const root = res.data;
      const payload = root?.data ?? root;
      const updated: Order = payload?.order ?? payload;

      setOrder(updated);
      alert("Order cancelled successfully.");
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "Failed to cancel order. Please try again."
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const handleAddressChange = (field: keyof AddressForm, value: string) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
  };

  const startEditAddress = () => {
    if (!order) return;
    if (!canEditAddress(order)) {
      alert("Address cannot be updated at this stage.");
      return;
    }

    const addr: any = (order as any).address;
    if (addr) {
      setAddressForm({
        fullName: addr.fullName || addr.name || "",
        phone: addr.phone || "",
        pincode: addr.pincode || "",
        line1: addr.line1 || "",
        line2: addr.line2 || "",
        city: addr.city || "",
        state: addr.state || "",
        landmark: addr.landmark || "",
      });
    } else {
      setAddressForm(emptyAddress);
    }
    setIsEditingAddress(true);
  };

  const handleSaveAddress = async () => {
    if (!order) return;
    if (!canEditAddress(order)) {
      alert("Address cannot be updated at this stage.");
      return;
    }

    if (
      !addressForm.fullName ||
      !addressForm.phone ||
      !addressForm.pincode ||
      !addressForm.line1 ||
      !addressForm.city ||
      !addressForm.state
    ) {
      alert("Please fill all required address fields.");
      return;
    }

    try {
      setIsSavingAddress(true);

      const res = await apiClient.put(`/orders/${orderId}/address`, {
        fullName: addressForm.fullName,
        phone: addressForm.phone,
        pincode: addressForm.pincode,
        line1: addressForm.line1,
        line2: addressForm.line2,
        city: addressForm.city,
        state: addressForm.state,
        landmark: addressForm.landmark,
      });

      const root = res.data;
      const payload = root?.data ?? root;
      const updated: Order = payload?.order ?? payload;

      setOrder(updated);

      // order se fresh address lekar form sync karo
      const newAddr: any = (updated as any).address;
      if (newAddr) {
        setAddressForm({
          fullName: newAddr.fullName || newAddr.name || "",
          phone: newAddr.phone || "",
          pincode: newAddr.pincode || "",
          line1: newAddr.line1 || "",
          line2: newAddr.line2 || "",
          city: newAddr.city || "",
          state: newAddr.state || "",
          landmark: newAddr.landmark || "",
        });
      }

      setIsEditingAddress(false);
      alert("Order address updated.");
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "Failed to update address. Please try again."
      );
    } finally {
      setIsSavingAddress(false);
    }
  };

  // ---------------- render ----------------

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

  const addr: any = (order as any).address;
  const pay: any = (order as any).payment;
  const status =
    (order as any).status || (order as any).paymentStatus || "Paid";

  return (
    <section className="space-y-3 rounded-md bg-white p-3 shadow-sm md:p-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="flex items-center gap-2 text-sm font-semibold text-slate-800 md:text-base">
          <Package className="h-4 w-4 text-brand-primary" />
          Order Details
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          {canCancel(order) && (
            <button
              type="button"
              disabled={isCancelling}
              onClick={handleCancelOrder}
              className="inline-flex items-center gap-1 rounded border border-red-400 px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60 md:text-xs"
            >
              <XCircle className="h-3.5 w-3.5" />
              {isCancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
          <Link
            href="/orders"
            className="text-[11px] font-semibold text-brand-primary hover:text-blue-700 md:text-xs"
          >
            Back to Orders
          </Link>
        </div>
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
            {formatDateTime((order as any).createdAt)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-500 md:text-xs">
            STATUS
          </p>
          <p className="text-xs font-medium text-green-700 md:text-sm">
            {status}
          </p>
        </div>
      </div>

      {/* Address + payment */}
      <div className="grid gap-3 md:grid-cols-2">
        {/* Address block */}
        <div className="rounded-md border border-slate-200 p-3 text-xs text-slate-700 md:p-4 md:text-sm">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-primary" />
              <h2 className="text-xs font-semibold text-slate-800 md:text-sm">
                Delivery Address
              </h2>
            </div>
            {canEditAddress(order) && (
              <button
                type="button"
                onClick={startEditAddress}
                className="inline-flex items-center gap-1 text-[11px] text-brand-primary hover:text-blue-700 md:text-xs"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Edit
              </button>
            )}
          </div>

          {!isEditingAddress ? (
            addr ? (
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
            )
          ) : (
            <div className="space-y-2 rounded-md bg-slate-50 p-2">
              <div className="grid gap-2 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
                    Full Name
                  </label>
                  <input
                    className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
                    value={addressForm.fullName}
                    onChange={(e) =>
                      handleAddressChange("fullName", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
                    Phone
                  </label>
                  <input
                    className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
                    value={addressForm.phone}
                    onChange={(e) =>
                      handleAddressChange("phone", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
                    Pincode
                  </label>
                  <input
                    className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
                    value={addressForm.pincode}
                    onChange={(e) =>
                      handleAddressChange("pincode", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
                    City
                  </label>
                  <input
                    className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
                    value={addressForm.city}
                    onChange={(e) =>
                      handleAddressChange("city", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
                    State
                  </label>
                  <input
                    className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
                    value={addressForm.state}
                    onChange={(e) =>
                      handleAddressChange("state", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
                    Landmark (optional)
                  </label>
                  <input
                    className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
                    value={addressForm.landmark}
                    onChange={(e) =>
                      handleAddressChange("landmark", e.target.value)
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
                    Address (House no, building, area)
                  </label>
                  <textarea
                    className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
                    rows={2}
                    value={addressForm.line1}
                    onChange={(e) =>
                      handleAddressChange("line1", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(false)}
                  className="rounded border border-slate-300 px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-100 md:text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSavingAddress}
                  onClick={handleSaveAddress}
                  className="rounded bg-brand-primary px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-70 md:text-xs"
                >
                  {isSavingAddress ? "Saving..." : "Save Address"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Payment block */}
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
              {formatPrice(order.amount)} {(order as any).currency || "INR"}
            </p>
            <p>
              <span className="font-semibold">Status: </span>
              {(order as any).paymentStatus || status}
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
          {(order.items as any[]).map((item, idx: number) => {
            const image =
              item.image ||
              (typeof item.product === "object" &&
                item.product?.images?.[0]?.url) ||
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
