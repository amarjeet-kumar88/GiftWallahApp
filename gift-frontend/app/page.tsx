import ProductGrid from "@/components/products/ProductGrid";
import { Product } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function fetchProducts(params: Record<string, string> = {}): Promise<Product[]> {
  const searchParams = new URLSearchParams({
    limit: "12",
    ...params,
  });

  const res = await fetch(`${API_BASE_URL}/products?${searchParams.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Failed to fetch products", await res.text());
    return [];
  }

  const json = await res.json();
  const data = json.data;

  // ✅ Normalize to always get an array
  let products: unknown = [];

  if (Array.isArray(data?.products)) {
    products = data.products;
  } else if (Array.isArray(data)) {
    products = data;
  } else if (data?.items && Array.isArray(data.items)) {
    // in case your backend returns { data: { items: [...] } }
    products = data.items;
  } else {
    products = [];
  }

  return products as Product[];
}

export default async function HomePage() {
  const latestProducts = await fetchProducts({
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const topDeals = await fetchProducts({
    sortBy: "price",
    sortOrder: "asc",
  });

  return (
    <main className="min-h-screen bg-slate-50 pb-8">
      {/* Hero / banner */}
      <section className="bg-white shadow-sm">
        <div className="container flex flex-col gap-3 py-4 md:flex-row md:items-center md:gap-6">
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-slate-900 md:text-2xl">
              Gifts, Deals & More – in one place 🎁
            </h1>
            <p className="mt-1 text-xs text-slate-600 md:mt-2 md:text-sm">
              Discover curated gifts, combos and festive specials with fast
              delivery.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] md:justify-end md:text-xs">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
              ✔️ Secure Payments
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
              🚚 Fast Delivery
            </span>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
              🎁 Gift-ready Packaging
            </span>
          </div>
        </div>
      </section>

      {/* Product sections */}
      <div className="mt-3 space-y-5 md:mt-4 md:space-y-6">
        <ProductGrid title="Latest Gifts & Products" products={latestProducts} />
        <ProductGrid title="Top Deals for You" products={topDeals} />
      </div>
    </main>
  );
}
