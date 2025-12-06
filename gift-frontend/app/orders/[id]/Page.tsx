import OrderDetailPageClient from "@/components/orders/OrderDetailPage";

interface OrderDetailPageProps {
  params: { id: string };
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  return (
    <main className="min-h-[70vh] bg-slate-50">
      <div className="container py-4 md:py-6">
        <OrderDetailPageClient orderId={params.id} />
      </div>
    </main>
  );
}
