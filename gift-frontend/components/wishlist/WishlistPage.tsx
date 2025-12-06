"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import { Wishlist, WishlistItem, Product } from "@/lib/types";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const getProductObj = (item: WishlistItem): Product | null => {
  if (!item.product) return null;
  if (typeof item.product === "string") {
    // sirf id mila hai – UI me minimal show kar sakte hain
    return {
      _id: item.product,
      name: "Product",
      price: 0,
      images: [],
    } as any;
  }
  return item.product as Product;
};

const getProductId = (item: WishlistItem): string | undefined => {
  if (typeof item.product === "string") return item.product;
  return (item.product as any)?._id;
};

const getProductImage = (product: Product | null): string => {
  if (!product) {
    return "https://via.placeholder.com/200x200.png?text=No+Image";
  }
  if (product.images && product.images.length > 0) {
    return product.images[0].url;
  }
  return "https://via.placeholder.com/200x200.png?text=No+Image";
};

export default function WishlistPageClient() {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await apiClient.get("/wishlist");
      console.log("Wishlist API response:", res.data);

      const root = res.data;
      const payload = root?.data ?? root;
      const wl = payload?.wishlist ?? payload;

      const items: WishlistItem[] = Array.isArray(wl?.items)
        ? wl.items
        : Array.isArray(payload?.items)
        ? payload.items
        : [];

      setWishlist({ items });
    } catch (err: any) {
      console.error(err);
      if (err?.response?.status === 401) {
        setError("Please login to view your wishlist.");
      } else {
        setError(
          err?.response?.data?.message ||
            "Failed to load wishlist. Please try again."
        );
      }
      setWishlist(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeFromWishlist = async (item: WishlistItem) => {
    const productId = getProductId(item);
    if (!productId) return;

    try {
      setRemovingId(productId);
      await apiClient.delete(`/wishlist/${productId}`);
      await fetchWishlist();
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "Failed to remove from wishlist. Please try again."
      );
    } finally {
      setRemovingId(null);
    }
  };

  const moveToCart = async (item: WishlistItem) => {
    const productId = getProductId(item);
    if (!productId) return;

    try {
      setMovingId(productId);
      // 1) Add to cart
      await apiClient.post("/cart/items", {
        productId,
        quantity: 1,
      });
      // 2) Remove from wishlist
      await apiClient.delete(`/wishlist/${productId}`);
      await fetchWishlist();
      alert("Moved to cart!");
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "Failed to move to cart. Please login and try again."
      );
    } finally {
      setMovingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="rounded-md bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
          Loading your wishlist...
        </p>
      </div>
    );
  }

  if (error && !wishlist) {
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

  if (!wishlist || wishlist.items.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="max-w-sm rounded-md bg-white p-4 text-center shadow-sm">
          <Heart className="mx-auto mb-2 h-8 w-8 text-pink-500" />
          <p className="text-sm font-semibold text-slate-800">
            Your wishlist is empty
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Tap the heart icon on any product to add it here.
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
    <section className="rounded-md bg-white p-3 shadow-sm md:p-4">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-sm font-semibold text-slate-800 md:text-base">
          <Heart className="h-4 w-4 text-pink-500" />
          My Wishlist ({wishlist.items.length})
        </h1>
        <p className="text-[11px] text-slate-500 md:text-xs">
          Save products to buy later
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-3">
        {wishlist.items.map((item, index) => {
          const product = getProductObj(item);
          const productId = getProductId(item);
          const imageUrl = getProductImage(product);
          const name = product?.name || "Product";
          const price = product?.salePrice ?? product?.price ?? 0;

          return (
            <div
              key={productId || `${name}-${index}`}
              className="flex flex-col rounded-md border border-slate-200 bg-white p-2 text-xs shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-3"
            >
              {/* Image */}
              <Link
                href={productId ? `/products/${productId}` : "#"}
                className="flex h-32 items-center justify-center overflow-hidden rounded-sm bg-slate-50 sm:h-40"
              >
                <img
                  src={imageUrl}
                  alt={name}
                  className="max-h-full max-w-full object-contain"
                />
              </Link>

              {/* Info */}
              <div className="mt-2 flex flex-1 flex-col gap-1 sm:mt-3">
                <Link
                  href={productId ? `/products/${productId}` : "#"}
                  className="line-clamp-2 text-xs font-medium text-slate-900 hover:text-brand-primary sm:text-sm"
                >
                  {name}
                </Link>

                {price > 0 && (
                  <p className="text-xs font-semibold text-slate-900 sm:text-sm">
                    {formatPrice(price)}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="mt-2 flex flex-col gap-2 sm:mt-3">
                <button
                  type="button"
                  onClick={() => moveToCart(item)}
                  disabled={movingId === productId}
                  className="flex items-center justify-center gap-1 rounded-sm bg-amber-500 px-2 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-amber-600 disabled:opacity-70 sm:text-xs"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  MOVE TO CART
                </button>
                <button
                  type="button"
                  onClick={() => removeFromWishlist(item)}
                  disabled={removingId === productId}
                  className="flex items-center justify-center gap-1 rounded-sm border border-slate-200 px-2 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50 disabled:opacity-70 sm:text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  REMOVE
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
