import WishlistPageClient from "@/components/wishlist/WishlistPage";

export default function WishlistPage() {
  return (
    <main className="min-h-[70vh] bg-slate-50">
      <div className="container py-4 md:py-6">
        <WishlistPageClient />
      </div>
    </main>
  );
}
