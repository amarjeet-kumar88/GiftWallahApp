// app/admin/products/[id]/page.tsx
import AdminProductForm from "@/components/admin/AdminProductForm";
import apiClient from "@/lib/apiClient";
import { Product } from "@/lib/types";
import EditProductPageClient from "@/components/admin/EditProductPageClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminEditProductPage({ params }: Props) {
  const { id } = await params;

  // server-side product fetch
  let product: Product | null = null;
  try {
    const res = await apiClient.get(`/admin/products`);
    const root = res.data;
    const payload = root?.data ?? root;
    const list = payload?.products ?? payload;
    const arr: Product[] = Array.isArray(list) ? list : [];
    product = arr.find((p) => (p as any)._id === id) || null;
  } catch {
    product = null;
  }

  return (
    <section className="space-y-3">
      <h1 className="text-sm font-semibold text-slate-900 md:text-base">
        Edit Product
      </h1>
      {product ? (
        <AdminProductForm mode="edit" initialProduct={product as any} productId={id} />
      ) : (
        <div className="mx-auto max-w-4xl px-3 py-4 md:px-4 md:py-6">
        <EditProductPageClient productId={id} />
      </div>
      )}
    </section>
  );
}
