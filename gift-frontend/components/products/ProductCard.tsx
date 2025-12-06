import Link from "next/link";
import { Product } from "@/lib/types";
import { Star } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0].url
      : "https://via.placeholder.com/300x300.png?text=No+Image";

  const rating = product.averageRating || 0;
  const isOnSale = !!product.salePrice && product.salePrice < product.price;

  const discount =
    isOnSale && product.salePrice
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

  return (
    <Link
      href={`/products/${product._id}`}
      className="group flex flex-col rounded-md border border-slate-200 bg-white p-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-3"
    >
      {/* Image */}
      <div className="flex h-32 items-center justify-center overflow-hidden rounded-sm bg-slate-50 sm:h-40">
        <img
          src={imageUrl}
          alt={product.name}
          className="max-h-full max-w-full object-contain transition group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="mt-2 flex flex-1 flex-col gap-1 sm:mt-3">
        <p className="line-clamp-2 text-xs font-medium text-slate-900 sm:text-sm">
          {product.name}
        </p>

        {/* Rating */}
        {rating > 0 && (
          <div className="inline-flex items-center gap-1 rounded-sm bg-green-600 px-1.5 py-0.5 text-[10px] font-semibold text-white sm:text-[11px]">
            <span>{rating.toFixed(1)}</span>
            <Star className="h-3 w-3 fill-white text-white" />
            {product.totalReviews && (
              <span className="ml-1 text-[9px] font-normal text-slate-100">
                ({product.totalReviews})
              </span>
            )}
          </div>
        )}

        {/* Price row */}
        <div className="mt-0.5 flex items-end gap-2 sm:mt-1">
          <span className="text-sm font-semibold text-slate-900 sm:text-base">
            {formatPrice(isOnSale && product.salePrice ? product.salePrice : product.price)}
          </span>
          {isOnSale && (
            <>
              <span className="text-[10px] text-slate-500 line-through sm:text-xs">
                {formatPrice(product.price)}
              </span>
              <span className="text-[10px] font-semibold text-green-600 sm:text-xs">
                {discount}% off
              </span>
            </>
          )}
        </div>

        {/* Brand / category */}
        <p className="mt-0.5 text-[10px] text-slate-500 sm:mt-1 sm:text-xs">
          {product.brand || product.category?.name || "\u00A0"}
        </p>
      </div>
    </Link>
  );
}
