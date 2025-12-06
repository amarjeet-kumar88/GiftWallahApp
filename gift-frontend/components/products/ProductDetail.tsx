"use client";

import { useEffect, useState } from "react";
import { Product, Review } from "@/lib/types";
import { Heart, ShoppingCart, Star } from "lucide-react";
import apiClient from "@/lib/apiClient";

interface ProductDetailProps {
  product: Product;
  reviews?: Review[];
}

export default function ProductDetail({ product, reviews = [] }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0].url
      : "https://via.placeholder.com/400x400.png?text=No+Image";

  const isOnSale = !!product.salePrice && product.salePrice < product.price;
  const discount =
    isOnSale && product.salePrice
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

  const rating = product.averageRating || 0;

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  // Initially check wishlist status (if logged in)
  useEffect(() => {
    const checkWishlist = async () => {
      try {
        const res = await apiClient.get(`/wishlist/check/${product._id}`);
        setInWishlist(!!res.data?.data?.inWishlist);
      } catch {
        // user not logged in or endpoint error – ignore
      }
    };
    checkWishlist();
  }, [product._id]);

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      await apiClient.post("/cart/items", {
        productId: product._id,
        quantity,
      });
      alert("Added to cart!"); // TODO: replace with proper toast UI
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "Failed to add to cart. Please login and try again."
      );
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    // Simple: redirect user to cart
    window.location.href = "/cart";
  };

  const toggleWishlist = async () => {
    try {
      setIsWishlistLoading(true);
      if (inWishlist) {
        await apiClient.delete(`/wishlist/${product._id}`);
        setInWishlist(false);
      } else {
        await apiClient.post("/wishlist", { productId: product._id });
        setInWishlist(true);
      }
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "Failed to update wishlist. Please login and try again."
      );
    } finally {
      setIsWishlistLoading(false);
    }
  };

  return (
    <div className="grid gap-4 rounded-md bg-white p-3 shadow-sm md:grid-cols-[1.2fr,2fr] md:gap-6 md:p-4">
      {/* Left: Image + actions */}
      <div className="flex flex-col items-center gap-3 border-b pb-3 md:border-b-0 md:border-r md:pb-0 md:pr-4">
        {/* Image responsive height */}
        <div className="flex h-64 w-full items-center justify-center overflow-hidden rounded-md bg-slate-50 sm:h-72 md:h-80">
          <img
            src={imageUrl}
            alt={product.name}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {/* Buttons */}
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-amber-500 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-600 disabled:opacity-70 sm:text-sm"
          >
            <ShoppingCart className="h-4 w-4" />
            ADD TO CART
          </button>
          <button
            onClick={handleBuyNow}
            disabled={isAdding}
            className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-orange-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-orange-700 disabled:opacity-70 sm:text-sm"
          >
            BUY NOW
          </button>
        </div>

        {/* Quantity + wishlist */}
        <div className="flex w-full items-center justify-between gap-3 text-[11px] text-slate-700 sm:text-xs">
          <div className="flex items-center gap-2">
            <span>Qty</span>
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="rounded border border-slate-300 px-2 py-1 text-[11px] sm:text-xs"
            >
              {[1, 2, 3, 4, 5].map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={toggleWishlist}
            disabled={isWishlistLoading}
            className={`flex items-center gap-1 text-[11px] sm:text-xs ${
              inWishlist ? "text-red-500" : "text-slate-700"
            }`}
          >
            <Heart
              className={`h-4 w-4 ${
                inWishlist ? "fill-red-500 text-red-500" : "text-slate-600"
              }`}
            />
            {inWishlist ? "Wishlisted" : "Add to Wishlist"}
          </button>
        </div>
      </div>

      {/* Right: Info */}
      <div className="space-y-3 text-xs sm:text-sm">
        <h1 className="text-base font-semibold text-slate-900 sm:text-lg md:text-xl">
          {product.name}
        </h1>
        {product.brand && (
          <p className="text-[11px] text-slate-500 sm:text-xs">
            Brand: {product.brand}
          </p>
        )}

        {/* Rating */}
        {rating > 0 && (
          <div className="inline-flex items-center gap-1 rounded-sm bg-green-600 px-2 py-1 text-[11px] font-semibold text-white sm:text-xs">
            <span>{rating.toFixed(1)}</span>
            <Star className="h-3 w-3 fill-white text-white" />
            {product.totalReviews && (
              <span className="ml-1 text-[10px] font-normal text-slate-100 sm:text-[11px]">
                {product.totalReviews} Ratings & Reviews
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="space-y-1">
          <div className="flex items-end gap-2">
            <span className="text-xl font-semibold text-slate-900 sm:text-2xl">
              {formatPrice(
                isOnSale && product.salePrice ? product.salePrice : product.price
              )}
            </span>
            {isOnSale && (
              <>
                <span className="text-xs text-slate-500 line-through sm:text-sm">
                  {formatPrice(product.price)}
                </span>
                <span className="text-xs font-semibold text-green-600 sm:text-sm">
                  {discount}% off
                </span>
              </>
            )}
          </div>
          <p className="text-[11px] text-slate-500 sm:text-xs">
            Inclusive of all taxes •{" "}
            {product.stock > 0 ? "In stock" : "Out of stock"}
          </p>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-2">
            <h2 className="mb-1 text-sm font-semibold text-slate-800">
              Description
            </h2>
            <p className="whitespace-pre-line text-[11px] text-slate-600 sm:text-xs">
              {product.description}
            </p>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-3 sm:mt-4">
          <h2 className="mb-2 text-sm font-semibold text-slate-800">
            Ratings & Reviews
          </h2>
          {reviews.length === 0 ? (
            <p className="text-[11px] text-slate-500 sm:text-xs">
              No reviews yet.
            </p>
          ) : (
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="rounded border border-slate-100 p-2 text-[11px] sm:text-xs"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded bg-green-600 px-1.5 py-0.5 text-[10px] font-semibold text-white sm:text-[11px]">
                      {review.rating}
                      <Star className="h-3 w-3 fill-white text-white" />
                    </span>
                    <span className="font-semibold text-slate-800">
                      {review.title || ""}
                    </span>
                  </div>
                  <p className="text-slate-600">{review.comment}</p>
                  <div className="mt-1 text-[9px] text-slate-500 sm:text-[10px]">
                    {review.user?.name && <span>by {review.user.name}</span>}
                    {review.createdAt && (
                      <span>
                        {" "}
                        •{" "}
                        {new Date(review.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
