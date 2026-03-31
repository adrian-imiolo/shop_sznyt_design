import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../types";

function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link to={`/sklep/${product.id}`}>
      <div
        className="overflow-hidden"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image with hover swap */}
        <div className="relative h-125">
          <div
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${hovered ? "opacity-0" : "opacity-100"}`}
            style={{ backgroundImage: `url(${product.imageUrl})` }}
          />
          <div
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${hovered ? "opacity-100" : "opacity-0"}`}
            style={{ backgroundImage: `url(${product.lifestyleImageUrl})` }}
          />
        </div>

        {/* Card text */}
        <div className="pt-4 pb-6">
          <h2 className="font-cormorant text-2xl text-near-black font-light mb-1">
            {product.name}
          </h2>
          <p className="font-cormorant text-base text-secondary-text italic mb-3">
            {product.tagline}
          </p>
          <p className="font-dm-sans text-sm text-near-black">
            {product.price} PLN
          </p>
        </div>
      </div>
    </Link>
  );
}

function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL as string}/products`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProducts(data);
      } catch {
        setError("Nie udało się załadować produktów. Spróbuj ponownie.");
      }
    }
    load();
  }, []);

  return (
    <main>
      {/* Page header */}
      <section className="bg-near-black px-6 py-32 flex items-end">
        <div className="max-w-6xl mx-auto w-full">
          <p className="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase mb-4">
            Sklep
          </p>
          <h1 className="font-cormorant text-5xl md:text-7xl text-warm-white font-light leading-tight">
            Poznaj nasze ramy.
          </h1>
        </div>
      </section>

      {/* Product grid */}
      <section className="bg-warm-white px-6 py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          {error ? (
            <p className="font-dm-sans text-sm text-red-600 col-span-2">{error}</p>
          ) : (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>
    </main>
  );
}

export default Shop;
