"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import { MapPin, CreditCard, ShoppingCart } from "lucide-react";

type CartItem = {
  product: string | { _id: string; name: string };
  name: string;
  image?: string;
  price: number;
  quantity: number;
};

type Cart = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
};

type SavedAddress = {
  _id: string;
  fullName: string;
  phone: string;
  pincode: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  landmark?: string;
  isDefault?: boolean;
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

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function CheckoutPageClient() {
  const router = useRouter();

  const [cart, setCart] = useState<Cart | null>(null);
  const [cartLoading, setCartLoading] = useState(true);

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [address, setAddress] = useState<AddressForm>(emptyAddress);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");

  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddressChange = (field: keyof AddressForm, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

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

  const fetchCart = async () => {
    try {
      setCartLoading(true);
      const res = await apiClient.get("/cart");
      const root = res.data;
      const payload = root?.data ?? root;
      const c = payload?.cart ?? payload;
      setCart(c);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "Failed to load cart. Please try again."
      );
    } finally {
      setCartLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await apiClient.get("/addresses");
      const root = res.data;
      const payload = root?.data ?? root;
      const list = payload?.addresses ?? payload;
      const arr: SavedAddress[] = Array.isArray(list) ? list : [];
      setSavedAddresses(arr);

      const def =
        arr.find((a) => a.isDefault) || (arr.length > 0 ? arr[0] : undefined);

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
    fetchCart();
    fetchAddresses();
  }, []);

  const validateAddress = () => {
    if (!address.fullName.trim()) return "Full name is required";
    if (!address.phone.trim()) return "Phone is required";
    if (!address.pincode.trim()) return "Pincode is required";
    if (!address.line1.trim()) return "Address line is required";
    if (!address.city.trim()) return "City is required";
    if (!address.state.trim()) return "State is required";
    return null;
  };

  const handlePlaceOrder = async () => {
    setError(null);

    const addrError = validateAddress();
    if (addrError) {
      setError(addrError);
      alert(addrError);
      return;
    }

    if (!cart || cart.totalItems === 0) {
      setError("Your cart is empty.");
      alert("Your cart is empty.");
      return;
    }

    // Razorpay SDK check
    // @ts-ignore
    const Razorpay = (window as any).Razorpay;
    if (!Razorpay) {
      alert("Razorpay SDK not loaded. Please refresh the page.");
      return;
    }

    try {
      setIsPlacing(true);

      // 1) Backend se Razorpay order create
      const orderRes = await apiClient.post("/checkout/create-order");
      const orderRoot = orderRes.data;
      const orderPayload = orderRoot?.data ?? orderRoot;
      const rzpOrder = orderPayload?.order ?? orderPayload;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "Gift Walah 365",
        description: "Order payment",
        order_id: rzpOrder.id,
        prefill: {
          name: address.fullName,
          contact: address.phone,
        },
        notes: {
          address: `${address.line1}, ${address.city}, ${address.state} - ${address.pincode}`,
        },
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

            const vRoot = verifyRes.data;
            const vPayload = vRoot?.data ?? vRoot;
            const createdOrder = vPayload?.order ?? vPayload;

            alert("Payment successful! Order placed.");
            if (createdOrder?._id) {
              router.push(`/orders/${createdOrder._id}`);
            } else {
              router.push("/orders");
            }
          } catch (err: any) {
            console.error(err);
            alert(
              err?.response?.data?.message ||
                "Payment verified, but failed to create order."
            );
          }
        },
        theme: {
          color: "#ff9f00",
        },
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "Failed to initiate payment. Please try again."
      );
      alert(
        err?.response?.data?.message ||
          "Failed to initiate payment. Please try again."
      );
    } finally {
      setIsPlacing(false);
    }
  };

  // ---------------- RENDER ----------------

  if (cartLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="rounded-md bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
          Loading checkout...
        </p>
      </div>
    );
  }

  if (!cart || cart.totalItems === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="max-w-sm rounded-md bg-white p-4 text-center shadow-sm">
          <ShoppingCart className="mx-auto mb-2 h-8 w-8 text-slate-400" />
          <p className="text-sm font-semibold text-slate-800">
            Your cart is empty
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Add items to your cart before checkout.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="grid gap-4 md:grid-cols-[2fr,1.2fr]">
      {/* Left: Address */}
      <div className="space-y-3 rounded-md bg-white p-3 shadow-sm md:p-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-brand-primary" />
          <h1 className="text-sm font-semibold text-slate-800 md:text-base">
            Delivery Address
          </h1>
        </div>

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

        <div className="grid gap-2 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
              Full Name
            </label>
            <input
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
              value={address.fullName}
              onChange={(e) => handleAddressChange("fullName", e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
              Phone
            </label>
            <input
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
              value={address.phone}
              onChange={(e) => handleAddressChange("phone", e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
              Pincode
            </label>
            <input
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
              value={address.pincode}
              onChange={(e) => handleAddressChange("pincode", e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
              City
            </label>
            <input
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
              value={address.city}
              onChange={(e) => handleAddressChange("city", e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
              State
            </label>
            <input
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
              value={address.state}
              onChange={(e) => handleAddressChange("state", e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
              Landmark (optional)
            </label>
            <input
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
              value={address.landmark}
              onChange={(e) => handleAddressChange("landmark", e.target.value)}
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
              onChange={(e) => handleAddressChange("line1", e.target.value)}
            />
          </div>
        </div>

        {error && (
          <p className="text-[11px] text-red-500 md:text-xs">{error}</p>
        )}
      </div>

      {/* Right: Order summary */}
      <div className="space-y-3 rounded-md bg-white p-3 shadow-sm md:p-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-orange-500" />
          <h2 className="text-sm font-semibold text-slate-800 md:text-base">
            Order Summary
          </h2>
        </div>

        <div className="space-y-2 border-b border-slate-100 pb-2 text-xs text-slate-700 md:text-sm">
          {cart.items.map((item, idx) => (
            <div key={idx} className="flex gap-2">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded bg-slate-50 md:h-14 md:w-14">
                <img
                  src={
                    item.image ||
                    "https://via.placeholder.com/60x60.png?text=No+Image"
                  }
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
          ))}
        </div>

        <div className="space-y-1 text-xs text-slate-700 md:text-sm">
          <div className="flex justify-between">
            <span>Items ({cart.totalItems})</span>
            <span>{formatPrice(cart.totalPrice)}</span>
          </div>
          <div className="flex justify-between font-semibold text-slate-900">
            <span>Total Amount</span>
            <span>{formatPrice(cart.totalPrice)}</span>
          </div>
          <p className="text-[11px] text-green-700 md:text-xs">
            You will not be charged until you complete the payment.
          </p>
        </div>

        <button
          type="button"
          disabled={isPlacing}
          onClick={handlePlaceOrder}
          className="flex w-full items-center justify-center gap-2 rounded bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 disabled:opacity-70"
        >
          {isPlacing ? "Processing..." : `Place Order & Pay ${formatPrice(cart.totalPrice)}`}
        </button>
      </div>
    </section>
  );
}
