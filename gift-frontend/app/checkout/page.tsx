import CheckoutPageClient from '@/components/checkout/CheckoutPage';

export default function CheckoutPage() {
  return (
    <main className="min-h-[70vh] bg-slate-50">
      <div className="container py-4 md:py-6">
        <CheckoutPageClient />
      </div>
    </main>
  );
}
