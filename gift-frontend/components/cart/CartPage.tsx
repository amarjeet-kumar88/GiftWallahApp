"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import { Cart, CartItem } from "@/lib/types";
import Link from "next/link";
import { Trash2, Plus, Minus } from "lucide-react";
import { useRouter } from "next/navigation";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const getProductId = (item: CartItem): string | undefined => {
  if (!item) return undefined;
  if (typeof item.product === "string") return item.product;
  return item.product?._id;
};

const getProductImage = (item: CartItem): string => {
  // 1) snapshot image
  if (item.image) return item.image;
  // 2) populated product images
  const p = item.product;
  if (p?.images && p.images.length > 0 && p.images[0].url) {
    return p.images[0].url;
  }
  return "https://via.placeholder.com/150x150.png?text=No+Image";
};

export default function CartPageClient() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await apiClient.get("/cart");

      console.log("Cart API response:", res.data);

      const root = res.data;
      const payload = root?.data ?? root;
      const cartData = payload?.cart ?? payload;

      const items: CartItem[] = Array.isArray(cartData?.items)
        ? cartData.items
        : [];

      const totalItems =
        typeof cartData?.totalItems === "number"
          ? cartData.totalItems
          : items.reduce((sum, item) => sum + (item.quantity || 0), 0);

      const totalPrice =
        typeof cartData?.totalPrice === "number"
          ? cartData.totalPrice
          : items.reduce(
              (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
              0
            );

      setCart({
        items,
        totalItems,
        totalPrice,
      });
    } catch (err: any) {
      console.error(err);
      if (err?.response?.status === 401) {
        setError("Please login to view your cart.");
      } else {
        setError(
          err?.response?.data?.message ||
            "Failed to load cart. Please try again."
        );
      }
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (item: CartItem, newQty: number) => {
    if (newQty < 1) return;
    const productId = getProductId(item);
    if (!productId) return;

    try {
      setUpdatingItemId(productId);
      // ✅ backend: POST /cart/items { productId, quantity }
      await apiClient.post("/cart/items", {
        productId,
        quantity: newQty,
      });
      await fetchCart();
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "Failed to update quantity. Please try again."
      );
    } finally {
      setUpdatingItemId(null);
    }
  };

  const removeItem = async (item: CartItem) => {
    const productId = getProductId(item);
    if (!productId) return;

    try {
      setUpdatingItemId(productId);
      // ✅ backend: DELETE /cart/items/:productId
      await apiClient.delete(`/cart/items/${productId}`);
      await fetchCart();
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "Failed to remove item. Please try again."
      );
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleGoToCheckout = () => {
    router.push("/checkout");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="rounded-md bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
          Loading your cart...
        </p>
      </div>
    );
  }

  if (error && !cart) {
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

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="max-w-sm rounded-md bg-white p-4 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-800">
            Your cart is empty
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Add some gifts and products to see them here.
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
    <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
      {/* Left: items list */}
      <section className="space-y-3 rounded-md bg-white p-3 shadow-sm md:p-4">
        <h1 className="text-sm font-semibold text-slate-800 md:text-base">
          My Cart ({cart.totalItems} items)
        </h1>

        <div className="divide-y divide-slate-100">
          {cart.items.map((item, index) => {
            const productId = getProductId(item);
            const imageUrl = getProductImage(item);
            const productName =
              typeof item.product === "object" && item.product?.name
                ? item.product.name
                : item.name;

            return (
              <div
                key={productId || `${productName}-${index}`}
                className="flex flex-col gap-3 py-3 md:flex-row md:items-center"
              >
                {/* Image */}
                <div className="flex w-full items-center justify-center md:w-28">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-md bg-slate-50">
                    <img
                      src={imageUrl}
                      alt={productName}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>

                {/* Info + controls */}
                <div className="flex flex-1 flex-col gap-2 text-xs text-slate-700 md:text-sm">
                  {productId ? (
                    <Link
                      href={`/products/${productId}`}
                      className="line-clamp-2 font-medium text-slate-900 hover:text-brand-primary"
                    >
                      {productName}
                    </Link>
                  ) : (
                    <p className="line-clamp-2 font-medium text-slate-900">
                      {productName}
                    </p>
                  )}

                  {/* Price row */}
                  <div className="flex flex-wrap items-end gap-2">
                    <span className="text-sm font-semibold text-slate-900 md:text-base">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <span className="text-[11px] text-slate-500 md:text-xs">
                      {item.quantity} x {formatPrice(item.price)} each
                    </span>
                  </div>

                  {/* Quantity + remove */}
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    {/* Qty controls */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 md:text-xs">
                        Qty
                      </span>
                      <div className="flex items-center rounded border border-slate-300">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item, item.quantity - 1)
                          }
                          disabled={
                            updatingItemId === productId ||
                            item.quantity <= 1
                          }
                          className="flex h-7 w-7 items-center justify-center text-slate-600 disabled:opacity-50"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-8 text-center text-xs md:text-sm">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item, item.quantity + 1)
                          }
                          disabled={updatingItemId === productId}
                          className="flex h-7 w-7 items-center justify-center text-slate-600 disabled:opacity-50"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeItem(item)}
                      disabled={updatingItemId === productId}
                      className="flex items-center gap-1 text-[11px] text-red-500 hover:text-red-600 md:text-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Right: price details */}
      <aside className="h-fit rounded-md bg-white p-3 text-xs text-slate-700 shadow-sm md:p-4 md:text-sm">
        <h2 className="border-b border-slate-200 pb-2 text-xs font-semibold text-slate-800 md:text-sm">
          PRICE DETAILS
        </h2>
        <div className="space-y-2 py-2">
          <div className="flex items-center justify-between">
            <span>Price ({cart.totalItems} items)</span>
            <span>{formatPrice(cart.totalPrice)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Delivery Charges</span>
            <span className="text-green-600">FREE</span>
          </div>
        </div>
        <div className="mt-2 border-t border-slate-200 pt-2">
          <div className="flex items-center justify-between font-semibold text-slate-900">
            <span>Total Amount</span>
            <span>{formatPrice(cart.totalPrice)}</span>
          </div>
        </div>
        <p className="mt-1 text-[11px] text-green-600 md:text-xs">
          You will save on this order compared to MRP.
        </p>

        <button
          type="button"
          onClick={handleGoToCheckout}
          className="mt-3 w-full rounded bg-orange-600 py-2 text-xs font-semibold text-white shadow-sm hover:bg-orange-700 md:text-sm"
        >
          PLACE ORDER
        </button>
      </aside>
    </div>
  );
}
