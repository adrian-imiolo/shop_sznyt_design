import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../hooks/useCart";
import type { Product } from "../types";
import Skeleton from "../components/Skeleton";
import Seo from "../components/Seo";
import { useResource } from "../hooks/useResource";

function ProductDetails() {
  const { id } = useParams();
  const { data: product, error: loadFailed } = useResource<Product>(`/products/${id}`);
  const error = loadFailed ? "Nie udało się załadować produktu." : null;
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem, items } = useCart();

  const cartItem = items.find((i) => i.id === Number(id));
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  function addedToCart() {
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 3000);
  }

  if (error)
    return (
      <>
        <Seo
          title="Produkt"
          description="Ręcznie robiona ramka z litego dębu od Sznyt Design. Designerski prezent, który zostaje na lata."
        />
        <p className="font-dm-sans text-sm text-red-600 p-6">{error}</p>
      </>
    );
  if (!product)
    return (
      <main className="flex flex-col md:flex-row lg:h-[calc(100vh-var(--spacing-nav))] lg:max-h-240">
        <Seo
          title="Produkt"
          description="Ręcznie robiona ramka z litego dębu od Sznyt Design. Designerski prezent, który zostaje na lata."
        />
        {/* Image side — 50% on tablet, 60% on desktop, left */}
        <Skeleton className="relative w-full md:w-1/2 lg:w-3/5 min-h-[60vh] lg:h-full overflow-hidden"></Skeleton>
        <div className="w-full bg-[#F5F3F0] md:w-1/2 lg:w-2/5 flex flex-col justify-between px-6 py-12 md:px-8 md:py-14 lg:px-16 lg:py-20">
          <div>
            <Skeleton className="w-1/2 h-6 mb-10"></Skeleton>
            <Skeleton className="w-1/2 h-6 mb-4"></Skeleton>
            <Skeleton className="w-5/6 h-12 mb-4"></Skeleton>
            <Skeleton className="w-3/5 h-8 mb-8"></Skeleton>
            <Skeleton className="w-full h-20 mb-10"></Skeleton>
          </div>

          {/* Bottom: price + stock + button */}
          <div className="border-t border-borders pt-8">
            <Skeleton className="w-1/3 h-10 mb-2"></Skeleton>
            <Skeleton className="w-1/3 h-6 mb-8"></Skeleton>
            <Skeleton className="w-1/2 h-10 inline-block px-10 py-3"></Skeleton>
          </div>
        </div>
      </main>
    );

  return (
    <main className="flex flex-col md:flex-row lg:h-[calc(100vh-var(--spacing-nav))] lg:max-h-240">
      <Seo
        title={product.name}
        description={`${product.tagline} Ręcznie robiona ramka z litego dębu od Sznyt Design — designerski prezent, który zostaje na lata.`}
      />
      {/* Add to cart feedback popup */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-near-black text-warm-white font-dm-sans text-sm px-6 py-4 flex items-center gap-3 transition-opacity duration-500 ${added ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <span className="text-accent">✓</span>
        <p>Dodano do koszyka!</p>
      </div>

      {/* Image side — 50% on tablet, 60% on desktop, left */}
      <div
        className="relative w-full md:w-1/2 lg:w-3/5 min-h-[60vh] lg:h-full overflow-hidden cursor-pointer bg-warm-white p-6 md:p-10"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className={`absolute inset-6 md:inset-10 bg-contain bg-center bg-no-repeat transition-opacity duration-700 ${hovered ? "opacity-0" : "opacity-100"}`}
          style={{ backgroundImage: `url(${product.imageUrl})` }}
        />
        <div
          className={`absolute inset-6 md:inset-10 bg-contain bg-center bg-no-repeat transition-opacity duration-700 ${hovered ? "opacity-100" : "opacity-0"}`}
          style={{ backgroundImage: `url(${product.lifestyleImageUrl})` }}
        />
      </div>

      {/* Text side — 50% on tablet, 40% on desktop, right */}

      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-between bg-[#F5F3F0] px-6 py-12 md:px-8 md:py-14 lg:px-16 lg:py-20">
        {/* Top: breadcrumb + product info */}
        <div>
          <p className="font-dm-sans text-xs text-secondary-text tracking-widest uppercase mb-10">
            <Link to="/sklep" className="hover:text-accent transition-colors">
              Sklep
            </Link>
            {" / "}
            {product.name}
          </p>
          <p className="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase mb-4">
            Sznyt Design
          </p>
          <h1 className="font-cormorant text-3xl md:text-4xl lg:text-5xl text-near-black font-light leading-tight mb-4">
            {product.name}
          </h1>
          <p className="font-cormorant text-lg text-secondary-text italic mb-8">
            {product.tagline}
          </p>
          <p className="font-dm-sans text-sm text-secondary-text leading-relaxed mb-10">
            {product.description}
          </p>
        </div>

        {/* Bottom: price + stock + button */}
        <div className="border-t border-borders pt-8">
          <p className="font-cormorant text-4xl text-near-black font-light mb-2">
            {product.price} PLN
          </p>
          <p className="font-dm-sans text-xs text-secondary-text tracking-widest uppercase mb-8">
            Dostępność:{" "}
            {product.stock > 0 ? `${product.stock} szt.` : "Brak w magazynie"}
          </p>
          <button
            disabled={cartQuantity >= product.stock}
            onClick={() => {
              const wasAdded = addItem({
                id: Number(id),
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                stock: product.stock,
              });
              if (wasAdded) {
                addedToCart();
              }
            }}
            className="disabled:opacity-50 disabled:cursor-not-allowed inline-block font-dm-sans text-sm text-near-black border border-near-black px-10 py-3 hover:bg-near-black hover:text-warm-white transition-colors duration-300"
          >
            {cartQuantity >= product.stock
              ? "Maksymalna ilość w koszyku"
              : "Dodaj do koszyka"}
          </button>
          <div className="mt-6">
            <Link
              to="/sklep"
              className="font-dm-sans text-xs text-secondary-text tracking-widest uppercase hover:text-accent transition-colors"
            >
              ← Odkryj całą kolekcję
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ProductDetails;
