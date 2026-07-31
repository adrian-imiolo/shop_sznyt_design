import { useState } from "react";
import { Link } from "react-router-dom";
import { formatPln } from "@sznyt/shared";
import type { Product } from "../types";
import Seo from "../components/Seo";
import Skeleton from "../components/Skeleton";
import { useResource } from "../hooks/useResource";

// Mirrors ProductCard's box model so the grid doesn't reflow when data lands.
function ProductCardSkeleton() {
  return (
    <div className="block border-b border-borders pb-16 last:border-b-0 last:pb-0 md:border-b-0 md:pb-0">
      <Skeleton className="aspect-[4/5] w-full" />
      <div className="pt-4">
        <Skeleton className="h-7 w-2/3 mb-1" />
        <Skeleton className="h-5 w-1/2 mb-3" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false);

  // Hairline separator, mobile only: the single column has no gutter to group by,
  // so pad below the caption and rule the card's bottom edge — the line lands
  // centred in the row gap. The last card is left open so it doesn't double up
  // with the border-t on the materials strip below.
  return (
    <Link
      to={`/sklep/${product.id}`}
      className="block border-b border-borders pb-16 last:border-b-0 last:pb-0 md:border-b-0 md:pb-0"
    >
      <div
        className="overflow-hidden"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative aspect-[4/5]">
          <div
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${hovered ? "opacity-0" : "opacity-100"}`}
            style={{ backgroundImage: `url(${product.imageUrl})` }}
          />
          <div
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${hovered ? "opacity-100" : "opacity-0"}`}
            style={{ backgroundImage: `url(${product.lifestyleImageUrl})` }}
          />
        </div>
        <div className="pt-4">
          <h2 className="font-cormorant text-2xl text-near-black font-light mb-1">
            {product.name}
          </h2>
          <p className="font-cormorant text-base text-secondary-text italic mb-3">
            {product.tagline}
          </p>
          <p className="font-dm-sans text-sm text-near-black">
            {formatPln(product.price)}
          </p>
        </div>
      </div>
    </Link>
  );
}

function Shop() {
  const { data: products, error: loadFailed } = useResource<Product[]>("/products");
  const error = loadFailed ? "Nie udało się załadować produktów. Spróbuj ponownie." : null;

  return (
    <main>
      <Seo
        title="Sklep"
        description="Kolekcja ręcznie robionych ramek z litego dębu. Każdy egzemplarz projektowany i wykonywany w Polsce — designerski prezent, który zostaje na lata."
      />
      {/* Page header */}
      <section className="bg-near-black px-6 py-16 md:py-32 flex items-end">
        <div className="max-w-6xl mx-auto w-full">
          <p className="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase mb-4">
            Sklep
          </p>
          <h1 className="font-cormorant text-4xl md:text-6xl lg:text-7xl text-warm-white font-light leading-tight">
            Poznaj nasze ramy.
          </h1>
        </div>
      </section>

      {/* Philosophy strip */}
      <section className="bg-warm-white border-b border-borders px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center gap-10 md:gap-20">
          <div className="md:w-1/2">
            <p className="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase mb-4">
              Nasze podejście
            </p>
            <h2 className="font-cormorant text-3xl md:text-4xl text-near-black font-light leading-snug">
              Każda rama to świadoma decyzja o formie i materiale.
            </h2>
          </div>
          <div className="md:w-1/2 flex flex-col gap-4">
            <p className="font-dm-sans text-sm text-secondary-text leading-relaxed">
              Nie produkujemy masowo. Wybieramy materiały, które starzeją się z godnością — z czasem nabierają charakteru, a nie go tracą.
            </p>
            <p className="font-dm-sans text-sm text-secondary-text leading-relaxed">
              Projektujemy ramy, które nie wychodzą z mody, bo nigdy do niej nie należały.
            </p>
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section className="bg-warm-white px-6 py-8 md:py-16">
        {/* max-w-4xl (not 6xl): keeps a 4:5 card + title inside one laptop viewport.
            Row gap is much larger than the card's internal pt-4 so each image reads as
            grouped with its own caption, not with the card below it. */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-y-16 md:gap-y-20 md:gap-x-10">
          {error ? (
            <p className="font-dm-sans text-sm text-red-600 col-span-2">{error}</p>
          ) : !products ? (
            <>
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </>
          ) : (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>

      {/* Materials strip */}
      <section className="bg-warm-white border-t border-borders px-6 py-12 md:py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          {[
            {
              label: "Materiał",
              title: "Wysoka jakość",
              text: "Wybieramy materiały, które mają charakter. Każdy detal jest decyzją, nie przypadkiem.",
            },
            {
              label: "Wykończenie",
              title: "Precyzja wykonania",
              text: "Stawiamy na rzemiosło — każda rama przechodzi kontrolę jakości zanim trafi do klienta.",
            },
            {
              label: "Trwałość",
              title: "Na lata",
              text: "Zaprojektowane tak, by służyć dekadami — nie sezonami.",
            },
          ].map((item) => (
            <div key={item.label}>
              <p className="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase mb-3">
                {item.label}
              </p>
              <h3 className="font-cormorant text-2xl text-near-black font-light mb-3">
                {item.title}
              </h3>
              <p className="font-dm-sans text-sm text-secondary-text leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Shop;
