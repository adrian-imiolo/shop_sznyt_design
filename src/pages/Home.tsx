import ProductSection from "../components/ProductSection";
import Hero from "../components/Hero";
import BrandStatement from "../components/BrandStatement";
import { useState, useEffect } from "react";
import type { Product } from "../types";

function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL as string}/products`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProducts(data);
      } catch {
        // products stays empty — page still renders with Hero and BrandStatement
      }
    }
    load();
  }, []);

  return (
    <>
      <Hero />
      <div id="kolekcja" />
      {products.map((product, index) => (
        <ProductSection
          id={product.id}
          key={product.id}
          name={product.name}
          tagline={product.tagline}
          description={product.description}
          price={product.price}
          imageUrl={product.imageUrl}
          lifestyleImageUrl={product.lifestyleImageUrl}
          reverse={index % 2 !== 0}
          stock={product.stock}
        />
      ))}
      <BrandStatement />

      {/* Why us — 3 columns */}
      <section className="bg-warm-white border-t border-borders px-6 py-12 md:py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          {[
            {
              label: "Materiał",
              title: "Wysoka jakość",
              text: "Wybieramy materiały z charakterem. Każdy detal jest decyzją, nie przypadkiem.",
            },
            {
              label: "Wykonanie",
              title: "Precyzja rzemiosła",
              text: "Każda rama przechodzi kontrolę jakości zanim trafi do klienta. Precyzja, której nie zastąpi masa.",
            },
            {
              label: "Projekt",
              title: "Ponadczasowa forma",
              text: "Minimalizm, który nie wychodzi z mody — bo nigdy do niej nie należał.",
            },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-3">
              <p className="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase">
                {item.label}
              </p>
              <h3 className="font-cormorant text-2xl text-near-black font-light">
                {item.title}
              </h3>
              <p className="font-dm-sans text-sm text-secondary-text leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default Home;
