import ProductDetail from "@/components/products/ProductDetail";
import { Product, Review } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ProductPageProps {
  params: Promise<{ id: string }>; // Next 15: params is Promise
}

async function fetchProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("Failed to fetch product", await res.text());
      return null;
    }
    const json = await res.json();
    // backend: { data: { product } } ya { data: product }
    const data = json.data;
    if (!data) return null;
    return (data.product || data) as Product;
  } catch (err) {
    console.error("Error fetching product", err);
    return null;
  }
}

async function fetchReviews(id: string): Promise<Review[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/reviews/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data?.reviews || json.data || []) as Review[];
  } catch {
    return [];
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  const [product, reviews] = await Promise.all([
    fetchProduct(id),
    fetchReviews(id),
  ]);

  if (!product) {
    return (
      <main className="min-h-[60vh] bg-slate-50">
        <div className="container flex items-center justify-center py-10">
          <p className="rounded-md bg-white px-4 py-3 text-sm text-slate-700 shadow">
            Product not found.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[60vh] bg-slate-50">
      <div className="container py-4">
        <ProductDetail product={product} reviews={reviews} />
      </div>
    </main>
  );
}
