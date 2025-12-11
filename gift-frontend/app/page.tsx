// app/page.tsx
import ProductGrid from "@/components/products/ProductGrid"; // optional - we also render internal grids below if you prefer
import { Product } from "@/lib/types";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Server-side fetch (keeps same normalization logic you used)
async function fetchProducts(params: Record<string, string> = {}): Promise<Product[]> {
  const searchParams = new URLSearchParams({ limit: "12", ...params });
  const res = await fetch(`${API_BASE_URL}/products?${searchParams.toString()}`, { cache: "no-store" });
  if (!res.ok) {
    console.error("Failed to fetch products", await res.text());
    return [];
  }
  const json = await res.json();
  const data = json.data;

  let products: unknown = [];
  if (Array.isArray(data?.products)) {
    products = data.products;
  } else if (Array.isArray(data)) {
    products = data;
  } else if (data?.items && Array.isArray(data.items)) {
    products = data.items;
  } else {
    products = [];
  }
  return products as Product[];
}

// Small helpers used by product card
const formatPrice = (value?: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value ?? 0);

const truncate = (s = "", n = 65) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

// Carousel component (server-side friendly — basic autoplay via CSS animation fallback)
function Carousel({ items }: { items: Product[] }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-sky-50 to-indigo-50 shadow-sm">
      {/* Desktop-style carousel: show first 4 slides on large screens via horizontal scroll + controls */}
      <div className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory p-4 md:p-6">
        {items.slice(0, 10).map((p) => {
          const img = p.images?.[0]?.url ?? "https://via.placeholder.com/400x400.png?text=No+Image";
          return (
            <article
              key={p._id}
              className="snap-start min-w-[80%] sm:min-w-[45%] md:min-w-[30%] lg:min-w-[22%] rounded-lg bg-white p-3 shadow-sm transition hover:shadow-lg"
            >
              <div className="flex h-44 items-center justify-center overflow-hidden rounded-md bg-slate-50">
                <img src={img} alt={p.name} className="max-h-full max-w-full object-contain" />
              </div>
              <div className="mt-3">
                <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">{truncate(p.name, 60)}</h3>
                <div className="mt-1 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500">{p.brand ?? ""}</div>
                    <div className="text-sm font-semibold text-slate-900">{formatPrice(p.salePrice ?? p.price)}</div>
                  </div>
                  <div className="text-right">
                    {p.salePrice && (
                      <div className="text-[11px] line-through text-slate-400">{formatPrice(p.price)}</div>
                    )}
                    {p.averageRating ? (
                      <div className="mt-1 inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                        ★ {p.averageRating.toFixed(1)}
                      </div>
                    ) : (
                      <div className="mt-1 text-[11px] text-slate-400">—</div>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <a
                    href={`/products/${p._id}`}
                    className="flex-1 rounded bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 text-center"
                  >
                    View
                  </a>
                  <button
                    data-product-id={p._id}
                    className="rounded border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    Add
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {/* subtle gradient edges */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-white/90 to-transparent md:hidden" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white/90 to-transparent md:hidden" />
    </div>
  );
}

// Product Card used in grid (client can reuse existing ProductGrid if available)
function ProductCard({ product }: { product: Product }) {
  const img = product.images?.[0]?.url ?? "https://via.placeholder.com/300x300.png?text=No+Image";
  const onSale = !!product.salePrice && product.salePrice < product.price;
  const discount = onSale ? Math.round(((product.price - product.salePrice!) / product.price) * 100) : 0;

  return (
    <article className="group rounded-lg bg-white p-3 shadow-sm transition hover:shadow-md">
      <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-md bg-slate-50">
        <img src={img} alt={product.name} className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105" />
        {onSale && (
          <div className="absolute left-2 top-2 rounded bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white">
            {discount}% OFF
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">{product.name}</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">{product.brand ?? ""}</div>
            <div className="text-sm font-semibold text-slate-900">{formatPrice(product.salePrice ?? product.price)}</div>
            {onSale && <div className="text-[11px] line-through text-slate-400">{formatPrice(product.price)}</div>}
          </div>
          <div className="flex flex-col items-end">
            {product.averageRating ? (
              <div className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                ★ {product.averageRating.toFixed(1)}
              </div>
            ) : (
              <div className="text-[11px] text-slate-400">—</div>
            )}
            <div className="mt-2 text-[11px] text-slate-500">{product.stock > 0 ? "In stock" : "Out of stock"}</div>
          </div>
        </div>

        <div className="mt-2 flex gap-2">
          <a href={`/products/${product._id}`} className="flex-1 rounded border border-slate-200 px-3 py-2 text-xs text-center font-medium hover:bg-slate-50">
            View
          </a>
          <button data-product-id={product._id} className="rounded bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600">
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}

// Grid section (title + subtle controls)
function ProductSection({ title, products }: { title: string; products: Product[] }) {
  return (
    <section className="rounded-md bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <a className="text-xs text-slate-500 hover:underline" href="/products">
          View all
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </section>
  );
}

// Final server component
export default async function HomePage() {
  const latestProducts = await fetchProducts({ sortBy: "createdAt", sortOrder: "desc", limit: "12" });
  const topDeals = await fetchProducts({ sortBy: "price", sortOrder: "asc", limit: "12" });
  const featured = latestProducts.length ? latestProducts.slice(0, 8) : topDeals.slice(0, 6);

  return (
    <main className="min-h-screen bg-slate-50 pb-12">
      {/* Hero */}
      <section className="bg-white shadow-sm">
        <div className="container mx-auto max-w-6xl px-4 py-6 md:flex md:items-center md:justify-between">
          <div className="md:flex-1">
            <h1 className="text-xl font-extrabold text-slate-900 md:text-3xl">Gifts, Deals & More — curated for you 🎁</h1>
            <p className="mt-2 text-sm text-slate-600 md:text-base">
              Discover curated gift combos, festival specials and fast delivery — all in one place.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">Secure Payments</span>
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">Fast Delivery</span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">Gift-ready Packaging</span>
            </div>
          </div>

          <div className="mt-4 md:mt-0 md:w-1/3">
            <div className="rounded-lg bg-gradient-to-r from-indigo-600 to-sky-600 p-4 text-white shadow-lg">
              <h3 className="text-sm font-semibold">Limited Time Offer</h3>
              <p className="mt-1 text-xs">Extra discount on select gift combos — while stocks last.</p>
              <a href="/products?deals=true" className="mt-3 inline-block rounded bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/20">Shop Deals</a>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4 mt-6 space-y-6">
        {/* Carousel */}
        <Carousel items={featured} />

        {/* Product Sections */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <ProductSection title="Latest Gifts & Products" products={latestProducts} />
            <ProductSection title="Top Deals for You" products={topDeals} />
          </div>

          <aside className="space-y-6">
            <div className="rounded-md bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-900">Why buy from us?</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>• Curated selection</li>
                <li>• Free returns within 7 days</li>
                <li>• Support local sellers</li>
              </ul>
            </div>

            <div className="rounded-md bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-900">Trending categories</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href="/products?category=gifts" className="rounded-full bg-slate-100 px-3 py-1 text-xs">Gifting</a>
                <a href="/products?category=toys" className="rounded-full bg-slate-100 px-3 py-1 text-xs">Toys</a>
                <a href="/products?category=home" className="rounded-full bg-slate-100 px-3 py-1 text-xs">Home</a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
