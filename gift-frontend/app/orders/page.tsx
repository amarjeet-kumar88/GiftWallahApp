import OrdersPageClient from "@/components/orders/OrdersPage";

export default function OrdersPage() {
  return (
    <main className="min-h-[70vh] bg-slate-50">
      <div className="container py-4 md:py-6">
        <OrdersPageClient />
      </div>
    </main>
  );
}