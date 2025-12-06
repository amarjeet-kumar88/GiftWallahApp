import CartPageClient from "@/components/cart/CartPage";

export default function CartPage() {
  return (
    <main className="min-h-[70vh] bg-slate-50">
      <div className="container py-4 md:py-6">
        <CartPageClient />
      </div>
    </main>
  );
}
