import { useState } from "react";
import { useCart } from "../context/CartContext";
import type { ProductSectionProps } from "../types";

function ProductSection({
  id,
  name,
  tagline,
  description,
  price,
  imageUrl,
  lifestyleImageUrl,
  reverse = false,
  stock,
}: ProductSectionProps) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem, items } = useCart();

  const cartItem = items.find((i) => i.id === id);
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  function addedToCart() {
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 3000);
  }

  return (
    <>
      {/* Add to cart feedback popup */}

      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-near-black text-warm-white font-dm-sans text-sm px-6 py-4 flex items-center gap-3 transition-opacity duration-500 ${added ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <span className="text-accent">✓</span>
        <p>Dodano do koszyka!</p>
      </div>

      <section
        className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} min-h-screen`}
      >
        {/* Image side */}
        <div
          className="relative w-full md:w-1/2 min-h-[60vh] md:min-h-screen overflow-hidden cursor-pointer"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Studio image — visible by default */}
          <div
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${hovered ? "opacity-0" : "opacity-100"}`}
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          {/* Lifestyle image — visible on hover */}
          <div
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${hovered ? "opacity-100" : "opacity-0"}`}
            style={{ backgroundImage: `url(${lifestyleImageUrl})` }}
          />
        </div>

        {/* Text side */}
        <div className="w-full md:w-1/2 flex items-center bg-warm-white px-6 py-12 md:px-20">
          <div className="max-w-md">
            <p className="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase mb-4">
              Sznyt Design
            </p>
            <h2 className="font-cormorant text-3xl md:text-4xl lg:text-5xl text-near-black font-light mb-4">
              {name}
            </h2>
            <p className="font-cormorant text-xl text-secondary-text italic mb-6">
              {tagline}
            </p>
            <p className="font-dm-sans text-sm text-secondary-text leading-relaxed mb-8">
              {description}
            </p>
            <p className="font-dm-sans text-lg text-near-black font-medium mb-8">
              {price} PLN
            </p>
            <button
              disabled={cartQuantity >= stock}
              onClick={() => {
                const wasAdded = addItem({ id, name, price, imageUrl, stock });
                if (wasAdded) {
                  addedToCart();
                }
              }}
              className="disabled:opacity-50 disabled:cursor-not-allowed inline-block font-dm-sans text-sm text-near-black border border-near-black px-8 py-3 hover:bg-near-black hover:text-warm-white transition-colors duration-300"
            >
              {cartQuantity >= stock
                ? "Maksymalna ilość w koszyku"
                : "Dodaj do koszyka"}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export default ProductSection;
