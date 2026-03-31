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
    </>
  );
}

export default Home;
