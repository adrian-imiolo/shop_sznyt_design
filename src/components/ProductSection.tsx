import { useState } from "react";
import { Link } from "react-router-dom";
import { formatPln } from "@sznyt/shared";
import { useCart } from "../hooks/useCart";
import Skeleton from "./Skeleton";
import type { ProductSectionProps } from "../types";

/**
 * Placeholder shown while /products is in flight. Lives next to the real
 * section so the two layouts stay in step — the panel split, the aspect
 * ratios and the lg contain-inset are duplicated here on purpose.
 */
export function ProductSectionSkeleton({ reverse = false }: { reverse?: boolean }) {
  return (
    <section
      className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} lg:h-[calc(100vh-var(--spacing-nav))] lg:max-h-240`}
    >
      <div className="relative w-full md:w-1/2 aspect-[4/5] lg:aspect-auto lg:h-full overflow-hidden bg-warm-white">
        <Skeleton className="absolute inset-0 lg:inset-10" />
      </div>

      <div className="w-full md:w-1/2 flex items-center bg-warm-white px-6 py-12 md:px-10 lg:px-20">
        <div className="max-w-md w-full">
          <Skeleton className="h-3 w-32 mb-4" />
          <Skeleton className="h-10 md:h-12 lg:h-14 w-3/4 mb-4" />
          <Skeleton className="h-6 w-2/3 mb-6" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-4/5 mb-8" />
          <Skeleton className="h-6 w-24 mb-8" />
          <Skeleton className="h-12 w-48" />
        </div>
      </div>
    </section>
  );
}

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
        className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} lg:h-[calc(100vh-var(--spacing-nav))] lg:max-h-240`}
      >
        {/* Image side — 4:5 cover crop up to md; on lg the section is viewport-height,
            so the whole frame must fit: contain inside a padded panel instead */}
        <Link
          to={`/sklep/${id}`}
          aria-label={`Zobacz produkt: ${name}`}
          className="relative w-full md:w-1/2 aspect-[4/5] lg:aspect-auto lg:h-full overflow-hidden cursor-pointer bg-warm-white"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Studio image — visible by default */}
          <div
            className={`absolute inset-0 lg:inset-10 bg-cover lg:bg-contain bg-center bg-no-repeat transition-opacity duration-700 ${hovered ? "opacity-0" : "opacity-100"}`}
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          {/* Lifestyle image — visible on hover; frame sits high in the scene, so bias the crop upward */}
          <div
            className={`absolute inset-0 lg:inset-10 bg-cover lg:bg-contain bg-no-repeat transition-opacity duration-700 ${hovered ? "opacity-100" : "opacity-0"}`}
            style={{ backgroundImage: `url(${lifestyleImageUrl})`, backgroundPosition: "center 15%" }}
          />
        </Link>

        {/* Text side */}
        <div className="w-full md:w-1/2 flex items-center bg-warm-white px-6 py-12 md:px-10 lg:px-20">
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
              {formatPln(price)}
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
