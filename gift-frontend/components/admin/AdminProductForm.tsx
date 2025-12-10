// components/admin/AdminProductForm.tsx
"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import { Product } from "@/lib/types";
import { Loader2 } from "lucide-react";

type Category = {
  _id: string;
  name: string;
};

type FormState = {
  name: string;
  slug: string;
  description: string;
  price: string;
  salePrice: string;
  stock: string;
  brand: string;
  categoryId: string;
  isActive: boolean;
  imageUrls: string; // comma-separated URLs
};

const emptyForm: FormState = {
  name: "",
  slug: "",
  description: "",
  price: "",
  salePrice: "",
  stock: "",
  brand: "",
  categoryId: "",
  isActive: true,
  imageUrls: "",
};

interface Props {
  mode: "create" | "edit";
  initialProduct?: Product & {
    stock?: number;
    isActive?: boolean;
  };
  productId?: string;
}

export default function AdminProductForm({
  mode,
  initialProduct,
  productId,
}: Props) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // prefill in edit mode
    if (mode === "edit" && initialProduct) {
      setForm({
        name: initialProduct.name || "",
        slug: (initialProduct as any).slug || "",
        description: initialProduct.description || "",
        price: String(initialProduct.price ?? ""),
        salePrice:
          initialProduct.salePrice != null
            ? String(initialProduct.salePrice)
            : "",
        stock: String((initialProduct as any).stock ?? ""),
        brand: initialProduct.brand || "",
        categoryId:
          typeof initialProduct.category === "string"
            ? (initialProduct.category as string)
            : (initialProduct.category as any)?._id || "",
        isActive: !!(initialProduct as any).isActive,
        imageUrls:
          (initialProduct.images || []).map((img) => img.url).join(", ") || "",
      });
    }
  }, [mode, initialProduct]);

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get("/admin/categories");
      const root = res.data;
      const payload = root?.data ?? root;
      const list = payload?.categories ?? payload;
      setCategories(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value } as any));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.price.trim()) {
      alert("Name and price are required.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      description: form.description.trim(),
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : undefined,
      stock: form.stock ? Number(form.stock) : 0,
      brand: form.brand.trim() || undefined,
      categoryId: form.categoryId || null,
      isActive: form.isActive,
      imageUrls: form.imageUrls,
    };

    try {
      setIsSaving(true);
      if (mode === "create") {
        await apiClient.post("/admin/products", payload);
        alert("Product created.");
        setForm(emptyForm);
      } else if (mode === "edit" && productId) {
        await apiClient.patch(`/admin/products/${productId}`, payload);
        alert("Product updated.");
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to save product.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3 rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-700 shadow-sm md:p-4 md:text-sm">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <div>
            <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
              Name
            </label>
            <input
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
              Slug (optional)
            </label>
            <input
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
              value={form.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              placeholder="auto from name if empty"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
              Description
            </label>
            <textarea
              rows={4}
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
                Price (MRP)
              </label>
              <input
                type="number"
                min={0}
                className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
                value={form.price}
                onChange={(e) => handleChange("price", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
                Sale Price
              </label>
              <input
                type="number"
                min={0}
                className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
                value={form.salePrice}
                onChange={(e) => handleChange("salePrice", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
                Stock
              </label>
              <input
                type="number"
                min={0}
                className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
                value={form.stock}
                onChange={(e) => handleChange("stock", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
                Brand
              </label>
              <input
                className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
                value={form.brand}
                onChange={(e) => handleChange("brand", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="space-y-2">
          <div>
            <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
              Category
            </label>
            <select
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
              value={form.categoryId}
              onChange={(e) => handleChange("categoryId", e.target.value)}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
              Image URLs (comma separated)
            </label>
            <textarea
              rows={3}
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
              placeholder="https://..., https://..."
              value={form.imageUrls}
              onChange={(e) => handleChange("imageUrls", e.target.value)}
            />
            <p className="mt-1 text-[10px] text-slate-500 md:text-[11px]">
              For now, paste uploaded image URLs. Later you can wire direct
              Cloudinary upload.
            </p>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <label className="flex items-center gap-2 text-[11px] text-slate-700 md:text-xs">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => handleChange("isActive", e.target.checked)}
                className="h-3.5 w-3.5 accent-brand-primary"
              />
              Active (visible on site)
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSubmit}
          className="inline-flex items-center gap-2 rounded bg-brand-primary px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-70 md:text-sm"
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "create"
            ? isSaving
              ? "Creating..."
              : "Create Product"
            : isSaving
            ? "Updating..."
            : "Update Product"}
        </button>
      </div>
    </div>
  );
}
