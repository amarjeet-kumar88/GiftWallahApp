"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import { Product } from "@/lib/types";
import {
  Boxes,
  Loader2,
  Search,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

type AdminProduct = Product & {
  stock?: number;
  isActive?: boolean;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">(
    "ALL"
  );

  const [updatingStockId, setUpdatingStockId] = useState<string | null>(null);
  const [togglingActiveId, setTogglingActiveId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await apiClient.get("/admin/products");
      console.log("Admin products:", res.data);

      const root = res.data;
      const payload = root?.data ?? root;
      const list = payload?.products ?? payload;

      const arr: AdminProduct[] = Array.isArray(list) ? list : [];
      setProducts(arr);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "Failed to load products. Please try again."
      );
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleStockChange = async (product: AdminProduct, value: string) => {
    const newStock = Number(value);
    if (Number.isNaN(newStock) || newStock < 0) return;

    try {
      setUpdatingStockId(product._id);
      const res = await apiClient.patch(`/admin/products/${product._id}/stock`, {
        stock: newStock,
      });

      const root = res.data;
      const payload = root?.data ?? root;
      const updated: AdminProduct = payload?.product ?? payload;

      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? updated : p))
      );
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "Failed to update stock."
      );
    } finally {
      setUpdatingStockId(null);
    }
  };

  const handleToggleActive = async (product: AdminProduct) => {
    try {
      setTogglingActiveId(product._id);
      const res = await apiClient.patch(
        `/admin/products/${product._id}/active`,
        {
          isActive: !product.isActive,
        }
      );

      const root = res.data;
      const payload = root?.data ?? root;
      const updated: AdminProduct = payload?.product ?? payload;

      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? updated : p))
      );
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "Failed to toggle active status."
      );
    } finally {
      setTogglingActiveId(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const name = (p.name || "").toLowerCase();
    const brand = (p.brand || "").toLowerCase();
    const query = search.toLowerCase();

    const matchSearch =
      !query || name.includes(query) || brand.includes(query);

    let matchStatus = true;
    if (statusFilter === "ACTIVE") {
      matchStatus = !!p.isActive;
    } else if (statusFilter === "INACTIVE") {
      matchStatus = !p.isActive;
    }

    return matchSearch && matchStatus;
  });

  if (isLoading) {
    return (
      <section className="flex min-h-[40vh] items-center justify-center">
        <div className="flex items-center gap-2 rounded-md bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading products...
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
            onClick={fetchProducts}
            className="mt-3 inline-block rounded bg-brand-primary px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-sm font-semibold text-slate-900 md:text-base">
            <Boxes className="h-4 w-4 text-emerald-500" />
            Products
          </h1>
          <p className="text-[11px] text-slate-500 md:text-xs">
            Manage inventory, pricing & visibility.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
          <div className="flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1">
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <input
              className="w-32 bg-transparent text-[11px] outline-none md:w-48 md:text-xs"
              placeholder="Search by name or brand"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] outline-none focus:border-blue-500 md:text-xs"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "ALL" | "ACTIVE" | "INACTIVE")
            }
          >
            <option value="ALL">All</option>
            <option value="ACTIVE">Active only</option>
            <option value="INACTIVE">Inactive only</option>
          </select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500 md:text-sm">
          No products found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-50 text-[11px] text-slate-500 md:text-xs">
                <th className="border-b border-slate-200 px-2 py-2 text-left">
                  Product
                </th>
                <th className="border-b border-slate-200 px-2 py-2 text-left">
                  Price
                </th>
                <th className="border-b border-slate-200 px-2 py-2 text-left">
                  Stock
                </th>
                <th className="border-b border-slate-200 px-2 py-2 text-left">
                  Status
                </th>
                <th className="border-b border-slate-200 px-2 py-2 text-left">
                  Category / Brand
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const img =
                  p.images && p.images.length > 0
                    ? p.images[0].url
                    : "https://via.placeholder.com/60x60.png?text=No+Image";

                const stock = p.stock ?? 0;
                const isActive = !!p.isActive;

                return (
                  <tr
                    key={p._id}
                    className="border-b border-slate-100 text-slate-700"
                  >
                    <td className="px-2 py-2 align-top">
                      <div className="flex gap-2">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded bg-slate-50 md:h-14 md:w-14">
                          <img
                            src={img}
                            alt={p.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <p className="line-clamp-2 text-[11px] font-semibold text-slate-900 md:text-xs">
                            {p.name}
                          </p>
                          {p._id && (
                            <p className="text-[10px] text-slate-400 md:text-[11px]">
                              #{p._id.slice(-8)}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-2 py-2 align-top">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-900">
                          {formatPrice(p.salePrice || p.price)}
                        </p>
                        {p.salePrice && p.salePrice < p.price && (
                          <p className="text-[11px] text-slate-500 line-through md:text-xs">
                            {formatPrice(p.price)}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-2 py-2 align-top">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          value={stock}
                          onChange={(e) =>
                            handleStockChange(p, e.target.value)
                          }
                          disabled={updatingStockId === p._id}
                          className="w-16 rounded border border-slate-300 px-1 py-1 text-[11px] outline-none focus:border-blue-500 md:text-xs"
                        />
                        {updatingStockId === p._id && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
                        )}
                      </div>
                      <p className="mt-1 text-[10px] text-slate-400 md:text-[11px]">
                        {stock === 0
                          ? "Out of stock"
                          : stock < 5
                          ? "Low stock"
                          : "In stock"}
                      </p>
                    </td>

                    <td className="px-2 py-2 align-top">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(p)}
                        disabled={togglingActiveId === p._id}
                        className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-[11px] hover:bg-slate-50 md:text-xs"
                      >
                        {isActive ? (
                          <>
                            <ToggleRight className="h-4 w-4 text-emerald-500" />
                            <span className="text-emerald-600">Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-500">Inactive</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-2 py-2 align-top">
                      <div className="space-y-0.5 text-[11px] md:text-xs">
                        {p.category && typeof p.category === "object" ? (
                          <p className="font-semibold text-slate-900">
                            {(p.category as any)?.name || "—"}
                          </p>
                        ) : (
                          <p className="font-semibold text-slate-900">
                            {p.category || "—"}
                          </p>
                        )}
                        <p className="text-slate-500">
                          Brand: {p.brand || "—"}
                        </p>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
