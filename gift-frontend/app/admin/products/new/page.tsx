// app/admin/products/new/page.tsx
import AdminProductForm from "@/components/admin/AdminProductForm";

export default function AdminNewProductPage() {
  return (
    <section className="space-y-3">
      <h1 className="text-sm font-semibold text-slate-900 md:text-base">
        Create Product
      </h1>
      <AdminProductForm mode="create" />
    </section>
  );
}
