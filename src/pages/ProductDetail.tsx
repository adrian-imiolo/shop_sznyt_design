import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";

type ProductDetails = {
  name: string;
  tagline: string;
  description: string;
  price: number;
  imageUrl: string;
  lifestyleImageUrl: string;
  stock: number;
} | null;

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState<ProductDetails>(null);
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    fetch(`http://localhost:3000/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data));
  }, [id]);

  if (!product) return <p>Ładowanie...</p>;

  function addedToCart() {
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 3000);
  }

  return (
    <main className="flex flex-col md:flex-row min-h-screen">
      {/* Add to cart feedback popup */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-near-black text-warm-white font-dm-sans text-sm px-6 py-4 flex items-center gap-3 transition-opacity duration-500 ${added ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <span className="text-accent">✓</span>
        <p>Dodano do koszyka!</p>
      </div>

      {/* Image side — 60% width, left */}
      <div
        className="relative w-full md:w-3/5 min-h-[60vh] md:min-h-screen overflow-hidden cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${hovered ? "opacity-0" : "opacity-100"}`}
          style={{ backgroundImage: `url(${product.imageUrl})` }}
        />
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${hovered ? "opacity-100" : "opacity-0"}`}
          style={{ backgroundImage: `url(${product.lifestyleImageUrl})` }}
        />
      </div>

      {/* Text side — 40% width, right */}

      <div className="w-full md:w-2/5 flex flex-col justify-between bg-[#F5F3F0] px-10 py-16 md:px-16 md:py-20">
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
          <h1 className="font-cormorant text-5xl text-near-black font-light leading-tight mb-4">
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
            onClick={() => {
              addItem({
                id: Number(id),
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
              });
              addedToCart();
            }}
            className="inline-block font-dm-sans text-sm text-near-black border border-near-black px-10 py-3 hover:bg-near-black hover:text-warm-white transition-colors duration-300"
          >
            Dodaj do koszyka
          </button>
        </div>
      </div>
    </main>
  );
}

export default ProductDetails;
