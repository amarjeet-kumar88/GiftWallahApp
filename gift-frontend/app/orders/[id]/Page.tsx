import OrderDetailPageClient from "@/components/orders/OrderDetailPage";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  // ❗ Next 15+ me params Promise hai – isliye await karo
  const { id } = await params;

  return (
    <main className="min-h-[70vh] bg-slate-50">
      <div className="container py-4 md:py-6">
        <OrderDetailPageClient orderId={id} />
      </div>
    </main>
  );
}
