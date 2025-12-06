import { Product, Category } from "@/lib/types";
import ProductCard from "@/components/products/ProductCard";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Raw search params type from Next
type RawSearchParams = {
  [key: string]: string | string[] | undefined;
};

type ResolvedSearchParams = {
  search?: string;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
};

interface ProductsPageProps {
  // 🔹 Next 15: searchParams is a Promise
  searchParams: Promise<RawSearchParams>;
}

function getParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data?.categories || json.data || []) as Category[];
  } catch {
    return [];
  }
}

async function fetchProducts(params: ResolvedSearchParams) {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.categoryId) query.set("categoryId", params.categoryId);
  if (params.minPrice) query.set("minPrice", params.minPrice);
  if (params.maxPrice) query.set("maxPrice", params.maxPrice);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  query.set("page", params.page || "1");
  query.set("limit", "20");

  const res = await fetch(`${API_BASE_URL}/products?${query.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Failed to fetch products", await res.text());
    return { products: [], total: 0, page: 1, pages: 1 };
  }

  const json = await res.json();
  const data = json.data || {};
  return {
    products: (data.products || []) as Product[],
    total: data.total || 0,
    page: data.page || 1,
    pages: data.pages || 1,
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // 🔹 Promise ko await karke phir use kar rahe
  const raw = await searchParams;

  const params: ResolvedSearchParams = {
    search: getParam(raw.search),
    categoryId: getParam(raw.categoryId),
    minPrice: getParam(raw.minPrice),
    maxPrice: getParam(raw.maxPrice),
    sortBy: getParam(raw.sortBy),
    sortOrder: getParam(raw.sortOrder),
    page: getParam(raw.page),
  };

  const [categories, { products, total, page, pages }] = await Promise.all([
    fetchCategories(),
    fetchProducts(params),
  ]);

  const selectedCategory = params.categoryId || "";
  const sortBy = params.sortBy || "createdAt";
  const sortOrder = params.sortOrder || "desc";
  const search = params.search || "";

  return (
    <main className="bg-slate-50">
      <div className="container flex flex-col gap-3 py-3 md:flex-row md:gap-4 md:py-4">
        {/* Sidebar filters (desktop only) */}
        <aside className="hidden w-64 shrink-0 rounded-md bg-white p-3 text-xs shadow-sm md:block">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Filters</h2>

          {search && (
            <p className="mb-3 text-[11px] text-slate-600">
              Showing results for{" "}
              <span className="font-semibold">"{search}"</span>
            </p>
          )}

          {/* Category filter */}
          <div className="mb-4">
            <p className="mb-1 text-[11px] font-semibold text-slate-700">
              CATEGORIES
            </p>
            <div className="max-h-48 space-y-1 overflow-y-auto text-xs">
              <a
                href="/products"
                className={`block rounded px-2 py-1 ${
                  !selectedCategory
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-slate-100"
                }`}
              >
                All
              </a>
              {categories.map((cat) => (
                <a
                  key={cat._id}
                  href={`/products?categoryId=${cat._id}${
                    search ? `&search=${encodeURIComponent(search)}` : ""
                  }`}
                  className={`block rounded px-2 py-1 ${
                    selectedCategory === cat._id
                      ? "bg-blue-50 text-blue-700"
                      : "hover:bg-slate-100"
                  }`}
                >
                  {cat.name}
                </a>
              ))}
            </div>
          </div>

          {/* Price filter */}
          <div className="mb-4">
            <p className="mb-1 text-[11px] font-semibold text-slate-700">
              PRICE
            </p>
            <div className="space-y-1 text-xs">
              {[
                { label: "Under ₹500", min: 0, max: 500 },
                { label: "₹500 - ₹1000", min: 500, max: 1000 },
                { label: "₹1000 - ₹2000", min: 1000, max: 2000 },
                { label: "Above ₹2000", min: 2000, max: 999999 },
              ].map((range) => {
                const qp = new URLSearchParams();
                if (search) qp.set("search", search);
                if (selectedCategory) qp.set("categoryId", selectedCategory);
                qp.set("minPrice", String(range.min));
                qp.set("maxPrice", String(range.max));
                qp.set("sortBy", sortBy);
                qp.set("sortOrder", sortOrder);
                return (
                  <a
                    key={range.label}
                    href={`/products?${qp.toString()}`}
                    className="block rounded px-2 py-1 hover:bg-slate-100"
                  >
                    {range.label}
                  </a>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <section className="flex-1">
          {/* Top summary & sort – mobile + desktop */}
          <div className="mb-2 flex flex-col justify-between gap-2 rounded-md bg-white p-3 text-xs text-slate-700 shadow-sm md:mb-3 md:flex-row md:items-center">
            <div>
              <p className="text-[12px] font-semibold md:text-sm">
                {search ? `Results for "${search}"` : "All Products"}
              </p>
              <p className="text-[10px] text-slate-500 md:text-[11px]">
                {total} items found • Page {page} of {pages}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <span className="hidden text-[11px] text-slate-500 md:inline">
                Sort by:
              </span>
              <a
                href={`/products?${new URLSearchParams({
                  ...(search ? { search } : {}),
                  ...(selectedCategory ? { categoryId: selectedCategory } : {}),
                  sortBy: "createdAt",
                  sortOrder: "desc",
                }).toString()}`}
                className={`rounded px-2 py-1 ${
                  sortBy === "createdAt"
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-slate-100"
                }`}
              >
                Newest
              </a>
              <a
                href={`/products?${new URLSearchParams({
                  ...(search ? { search } : {}),
                  ...(selectedCategory ? { categoryId: selectedCategory } : {}),
                  sortBy: "price",
                  sortOrder: "asc",
                }).toString()}`}
                className={`rounded px-2 py-1 ${
                  sortBy === "price" && sortOrder === "asc"
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-slate-100"
                }`}
              >
                Price: Low to High
              </a>
              <a
                href={`/products?${new URLSearchParams({
                  ...(search ? { search } : {}),
                  ...(selectedCategory ? { categoryId: selectedCategory } : {}),
                  sortBy: "price",
                  sortOrder: "desc",
                }).toString()}`}
                className={`rounded px-2 py-1 ${
                  sortBy === "price" && sortOrder === "desc"
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-slate-100"
                }`}
              >
                Price: High to Low
              </a>
            </div>
          </div>

          {/* Products grid */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-3">
            {products.length === 0 ? (
              <p className="col-span-full rounded-md bg-white p-4 text-center text-xs text-slate-600 shadow-sm md:text-sm">
                No products found. Try changing filters or search.
              </p>
            ) : (
              products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            )}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="mt-3 flex items-center justify-center gap-1 text-[11px] md:mt-4 md:gap-2 md:text-xs">
              {Array.from({ length: pages }).map((_, idx) => {
                const p = idx + 1;
                const qp = new URLSearchParams({
                  ...(search ? { search } : {}),
                  ...(selectedCategory ? { categoryId: selectedCategory } : {}),
                  sortBy,
                  sortOrder,
                  page: String(p),
                });
                return (
                  <a
                    key={p}
                    href={`/products?${qp.toString()}`}
                    className={`rounded px-2 py-1 ${
                      p === page
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {p}
                  </a>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
