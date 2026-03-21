import ProductSection from "../components/ProductSection";
import Hero from "../components/Hero";
import BrandStatement from "../components/BrandStatement";
import { useState, useEffect } from "react";

type Products = {
  id: number;
  name: string;
  tagline: string;
  description: string;
  price: number;
  imageUrl: string;
  lifestyleImageUrl: string;
};

function Home() {
  const [products, setProducts] = useState<Products[]>([]);
  useEffect(() => {
    async function load() {
      const res = await fetch(`http://localhost:3000/products`);
      const data = await res.json();
      setProducts(data);
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
        />
      ))}
      <BrandStatement />
    </>
  );
}

export default Home;
