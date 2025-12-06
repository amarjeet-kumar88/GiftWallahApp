"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import { SavedAddress } from "@/lib/types";
import { useRouter } from "next/navigation";

interface AddressForm {
  fullName: string;
  phone: string;
  pincode: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  landmark: string;
}

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

export default function CheckoutPageClient() {
  const router = useRouter();

  const [cart, setCart] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">(
    "new"
  );
  const [address, setAddress] = useState<AddressForm>(emptyAddress);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // 🔹 Fetch cart + saved addresses
  const fetchCart = async () => {
    const res = await apiClient.get("/cart");
    const root = res.data;
    const payload = root?.data ?? root;
    setCart(payload?.cart ?? payload);
  };

  const fetchAddresses = async () => {
    try {
      const res = await apiClient.get("/addresses");
      const root = res.data;
      const payload = root?.data ?? root;
      const list = payload?.addresses ?? payload;
      const arr: SavedAddress[] = Array.isArray(list) ? list : [];
      setSavedAddresses(arr);

      // Default address prefill
      const def =
        arr.find((a) => a.isDefault) ||
        (arr.length > 0 ? arr[0] : undefined);
      if (def) {
        setSelectedAddressId(def._id);
        setAddress({
          fullName: def.fullName,
          phone: def.phone,
          pincode: def.pincode,
          line1: def.line1,
          line2: def.line2 || "",
          city: def.city,
          state: def.state,
          landmark: def.landmark || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch addresses", err);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        await Promise.all([fetchCart(), fetchAddresses()]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // 🔹 Jab dropdown se koi saved address select ho
  const handleSelectAddress = (value: string) => {
    setSelectedAddressId(value);
    if (value === "new") {
      setAddress(emptyAddress);
      return;
    }
    const addr = savedAddresses.find((a) => a._id === value);
    if (addr) {
      setAddress({
        fullName: addr.fullName,
        phone: addr.phone,
        pincode: addr.pincode,
        line1: addr.line1,
        line2: addr.line2 || "",
        city: addr.city,
        state: addr.state,
        landmark: addr.landmark || "",
      });
    }
  };

  const handleChange = (field: keyof AddressForm, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async () => {
    if (!cart || !cart.totalItems) {
      alert("Your cart is empty.");
      return;
    }

    if (!address.fullName || !address.phone || !address.pincode || !address.line1) {
      alert("Please fill required address fields.");
      return;
    }

    try {
      setIsPlacingOrder(true);

      // 1) Backend me Razorpay order create
      const createOrderRes = await apiClient.post(
        "/checkout/create-order",
        {
          address, // yahi object backend me jayega
        }
      );

      const { order } =
        createOrderRes.data?.data ?? createOrderRes.data ?? {};

      if (!order?.id) {
        alert("Failed to create Razorpay order.");
        return;
      }

      // 2) Razorpay checkout open
      const rzpKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!;
      // @ts-ignore
      const Razorpay = (window as any).Razorpay;
      if (!Razorpay) {
        alert("Razorpay SDK not loaded.");
        return;
      }

      const options = {
        key: rzpKey,
        amount: order.amount,
        currency: order.currency,
        name: "Gift App",
        description: "Order payment",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await apiClient.post(
              "/checkout/verify-payment",
              {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                address,
              }
            );

            console.log("Payment verified:", verifyRes.data);
            alert("Payment successful! Order placed.");
            router.push("/orders");
          } catch (err: any) {
            console.error(err);
            alert(
              err?.response?.data?.message ||
                "Payment verification failed. Please contact support."
            );
          }
        },
        prefill: {
          name: address.fullName,
          contact: address.phone,
        },
        theme: {
          color: "#2874f0",
        },
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "Failed to start payment. Please try again."
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="rounded-md bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
          Loading checkout...
        </p>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="rounded-md bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
          Your cart is empty.
        </p>
      </div>
    );
  }

  return (
    <section className="grid gap-4 md:grid-cols-[2fr,1fr]">
      {/* Address section */}
      <div className="space-y-3 rounded-md bg-white p-3 shadow-sm md:p-4">
        <h1 className="text-sm font-semibold text-slate-800 md:text-base">
          Delivery Address
        </h1>

        {/* Saved addresses dropdown */}
        {savedAddresses.length > 0 && (
          <div className="space-y-1">
            <label className="text-[11px] text-slate-600 md:text-xs">
              Choose saved address
            </label>
            <select
              value={selectedAddressId}
              onChange={(e) => handleSelectAddress(e.target.value)}
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
            >
              <option value="new">Use new address</option>
              {savedAddresses.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.fullName} • {a.city} ({a.pincode})
                  {a.isDefault ? " [Default]" : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Address form (always editable) */}
        <div className="grid gap-2 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
              Full Name
            </label>
            <input
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
              value={address.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
              Phone
            </label>
            <input
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
              value={address.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
              Pincode
            </label>
            <input
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
              value={address.pincode}
              onChange={(e) => handleChange("pincode", e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
              City
            </label>
            <input
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
              value={address.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
              State
            </label>
            <input
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
              value={address.state}
              onChange={(e) => handleChange("state", e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
              Landmark (optional)
            </label>
            <input
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
              value={address.landmark}
              onChange={(e) => handleChange("landmark", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
              Address (House no, building, area)
            </label>
            <textarea
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
              rows={2}
              value={address.line1}
              onChange={(e) => handleChange("line1", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Right: Order summary + CTA */}
      <div className="space-y-3 rounded-md bg-white p-3 shadow-sm md:p-4">
        <h2 className="text-sm font-semibold text-slate-800 md:text-base">
          Order Summary
        </h2>

        <div className="space-y-1 text-xs text-slate-700 md:text-sm">
          <p>
            Items: <span className="font-semibold">{cart.totalItems}</span>
          </p>
          <p>
            Total:{" "}
            <span className="font-semibold">
              ₹{cart.totalPrice?.toLocaleString("en-IN")}
            </span>
          </p>
        </div>

        <button
          type="button"
          disabled={isPlacingOrder}
          onClick={handlePlaceOrder}
          className="mt-3 w-full rounded bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 disabled:opacity-70"
        >
          {isPlacingOrder
            ? "Processing..."
            : `Place Order & Pay ₹${cart.totalPrice?.toLocaleString("en-IN")}`}
        </button>
      </div>
    </section>
  );
}
