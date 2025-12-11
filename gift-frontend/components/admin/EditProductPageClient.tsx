"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";
import { Product } from "@/lib/types";
import { Boxes, Loader2, Image as ImageIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  productId: string;
}

interface CategoryOption {
  _id: string;
  name: string;
  parent?: { _id: string; name: string } | null;
}

interface ProductForm {
  name: string;
  brand: string;
  description: string;
  price: string;
  salePrice: string;
  stock: string;
  categoryId: string;
  isActive: boolean;
}

const emptyForm: ProductForm = {
  name: "",
  brand: "",
  description: "",
  price: "",
  salePrice: "",
  stock: "",
  categoryId: "",
  isActive: true,
};

export default function EditProductPageClient({ productId }: Props) {
  const router = useRouter();

  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------- Fetch product + categories ----------
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1) Product detail
      const prodRes = await apiClient.get(`/products/${productId}`);
      const rootProd = prodRes.data;
      const payloadProd = rootProd?.data ?? rootProd;
      const p: Product = (payloadProd?.product ?? payloadProd) as Product;

      // 2) Categories list
      const catRes = await apiClient.get("/categories");
      const rootCat = catRes.data;
      const payloadCat = rootCat?.data ?? rootCat;
      const list = (payloadCat?.categories ?? payloadCat) as CategoryOption[];

      setCategories(Array.isArray(list) ? list : []);

      // Prefill form
      const categoryId =
        typeof p.category === "string"
          ? p.category
          : (p.category as any)?._id ?? "";

      setForm({
        name: p.name || "",
        brand: p.brand || "",
        description: p.description || "",
        price: p.price?.toString() || "",
        salePrice: p.salePrice ? p.salePrice.toString() : "",
        stock: p.stock?.toString() || "0",
        categoryId,
        isActive: (p as any).isActive ?? true,
      });

      const firstImg = p.images && p.images.length > 0 ? p.images[0].url : null;
      setCurrentImage(firstImg);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message || "Failed to load product or categories."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // ---------- Handlers ----------

  const handleInputChange = (
    field: keyof ProductForm,
    value: string | boolean
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.price || !form.stock) {
      alert("Name, price and stock are required.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      let uploadedImageUrl: string | null = currentImage;

      // 1) Agar naya file select hua hai -> pehle Cloudinary pe upload karo
      if (imageFile) {
        const fd = new FormData();
        fd.append("image", imageFile);

        const uploadRes = await apiClient.post(
          "/admin/products/upload",
          fd,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        const uploadRoot = uploadRes.data;
        const uploadPayload = uploadRoot?.data ?? uploadRoot;

        // backend pe tumne jo bhi key rakhi ho – dono handle kar rahe:
        uploadedImageUrl =
          uploadPayload.imageUrl || uploadPayload.url || uploadedImageUrl;

        if (!uploadedImageUrl) {
          throw new Error("Upload success but image URL missing from response");
        }

        // UI preview turant update
        setCurrentImage(uploadedImageUrl);
      }

      // 2) Product update payload
      const payload: any = {
        name: form.name.trim(),
        brand: form.brand.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        isActive: form.isActive,
      };

      if (form.salePrice) payload.salePrice = Number(form.salePrice);
      if (form.categoryId) payload.categoryId = form.categoryId;

      // slug ko simple name se set kar sakte ho
      payload.slug = form.name.trim();

      // YAHAN sabse important: imageUrls backend ko bhejna
      if (uploadedImageUrl) {
        payload.imageUrls = [uploadedImageUrl];
      }

      const res = await apiClient.patch(
        `/admin/products/${productId}`,
        payload
      );

      console.log("Update product response:", res.data);

      alert("Product updated successfully.");
      router.push("/admin/products");
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message || "Failed to update product.";
      setError(msg);
      alert(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // ---------- UI ----------

  if (isLoading) {
    return (
      <section className="flex min-h-[40vh] items-center justify-center">
        <div className="flex items-center gap-2 rounded-md bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading product...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-sm font-semibold text-slate-900 md:text-base">
            <Boxes className="h-4 w-4 text-brand-primary" />
            Edit Product
          </h1>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1 rounded border border-slate-200 px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-100 md:text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
        </div>

        <div className="rounded-md bg-red-50 p-3 text-xs text-red-700 md:text-sm">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-sm font-semibold text-slate-900 md:text-base">
            <Boxes className="h-4 w-4 text-brand-primary" />
            Edit Product
          </h1>
          <p className="text-[11px] text-slate-500 md:text-xs">
            Update product details, price, stock and image.
          </p>
        </div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 rounded border border-slate-200 px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-100 md:text-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Products
        </Link>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:p-4"
      >
        {/* Image + Active */}
        <div className="grid gap-4 md:grid-cols-[1.2fr,1fr]">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 md:text-sm">
              Product Image
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-md border border-dashed border-slate-300 bg-slate-50">
                {imageFile ? (
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : currentImage ? (
                  <img
                    src={currentImage}
                    alt="Current"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center text-[10px] text-slate-400">
                    <ImageIcon className="mb-1 h-5 w-5" />
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full cursor-pointer text-[11px] text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-[11px] file:font-semibold file:text-white hover:file:bg-slate-900 md:text-xs"
                />
                <p className="text-[10px] text-slate-400 md:text-[11px]">
                  Leave empty to keep current image. New upload will replace the
                  primary image.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 rounded-md bg-slate-50 p-3 text-xs md:text-sm">
            <p className="text-[11px] font-semibold text-slate-700 md:text-xs">
              Status
            </p>
            <label className="flex items-center gap-2 text-[11px] text-slate-700 md:text-xs">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 accent-blue-600"
                checked={form.isActive}
                onChange={(e) =>
                  handleInputChange("isActive", e.target.checked)
                }
              />
              <span>Active product (visible on storefront)</span>
            </label>
          </div>
        </div>

        {/* Basic details */}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 md:text-sm">
              Product Name<span className="text-red-500">*</span>
            </label>
            <input
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
              value={form.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g. Teddy Bear Soft Toy 30cm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 md:text-sm">
              Brand
            </label>
            <input
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
              value={form.brand}
              onChange={(e) => handleInputChange("brand", e.target.value)}
              placeholder="e.g. Giftwalah"
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 md:text-sm">
            Category
          </label>
          <select
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
            value={form.categoryId}
            onChange={(e) => handleInputChange("categoryId", e.target.value)}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.parent ? `${c.parent.name} › ${c.name}` : c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Pricing */}
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 md:text-sm">
              Price (MRP) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={0}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
              value={form.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 md:text-sm">
              Sale Price
            </label>
            <input
              type="number"
              min={0}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
              value={form.salePrice}
              onChange={(e) =>
                handleInputChange("salePrice", e.target.value)
              }
            />
            <p className="text-[10px] text-slate-400 md:text-[11px]">
              Leave blank if no discount.
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 md:text-sm">
              Stock<span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={0}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
              value={form.stock}
              onChange={(e) => handleInputChange("stock", e.target.value)}
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 md:text-sm">
            Description
          </label>
          <textarea
            rows={4}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
            value={form.description}
            onChange={(e) =>
              handleInputChange("description", e.target.value)
            }
            placeholder="Highlight key features, material, size, occasions, etc."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <Link
            href="/admin/products"
            className="rounded-md border border-slate-300 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 md:text-sm"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 border border-slate-300 rounded-md bg-brand-primary px-4 py-1.5 text-xs font-semibold text-black shadow-sm hover:bg-blue-700 disabled:opacity-70 md:text-sm"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>
    </section>
  );
}
