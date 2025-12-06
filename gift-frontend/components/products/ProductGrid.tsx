import { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  title: string;
  products: Product[] | any;
}

export default function ProductGrid({ title, products }: ProductGridProps) {
  // ✅ Agar products array nahi hai to kuch mat dikhao
  if (!Array.isArray(products) || products.length === 0) return null;

  return (
    <section className="mb-4 md:mb-8">
      <div className="container">
        <h2 className="mb-2 text-sm font-semibold text-slate-800 md:mb-3 md:text-lg">
          {title}
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-3">
          {products.map((product: Product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
