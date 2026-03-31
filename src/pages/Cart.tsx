import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "@clerk/react";

function Cart() {
  const { items, removeItem, updateQuantity } = useCart();
  const { userId } = useAuth();

  async function handleCheckout() {
    const res = await fetch(`${import.meta.env.VITE_API_URL as string}/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, userId }),
    });
    const data = await res.json();
    window.location.href = data.url;
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-warm-white flex flex-col items-center justify-center px-6">
        <p className="font-cormorant text-4xl text-near-black font-light mb-4">
          Twój koszyk jest pusty.
        </p>
        <Link
          to="/sklep"
          className="font-dm-sans text-sm text-near-black border border-near-black px-10 py-3 hover:bg-near-black hover:text-warm-white transition-colors duration-300"
        >
          Przejdź do sklepu
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-warm-white px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-cormorant text-5xl text-near-black font-light mb-12">
          Koszyk
        </h1>

        {/* Item list */}
        <div className="flex flex-col divide-y divide-borders">
          {items.map((item) => (
            <div key={item.id} className="flex gap-6 py-8 items-center">
              {/* Product image */}
              <div
                className="w-24 h-24 bg-cover bg-center shrink-0"
                style={{ backgroundImage: `url(${item.imageUrl})` }}
              />

              {/* Name + price */}
              <div className="flex-1">
                <p className="font-cormorant text-2xl text-near-black font-light mb-1">
                  {item.name}
                </p>
                <p className="font-dm-sans text-sm text-secondary-text">
                  {item.price} PLN / szt.
                </p>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="w-8 h-8 border border-borders text-near-black font-dm-sans text-lg leading-none hover:bg-near-black hover:text-warm-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="font-dm-sans text-sm text-near-black w-4 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    updateQuantity(
                      item.id,
                      item.quantity < item.stock
                        ? item.quantity + 1
                        : item.quantity,
                    )
                  }
                  className="w-8 h-8 border border-borders text-near-black font-dm-sans text-lg leading-none hover:bg-near-black hover:text-warm-white transition-colors"
                >
                  +
                </button>
              </div>

              {/* Line total + remove */}
              <div className="flex flex-col items-end gap-2 w-32 shrink-0">
                <p className="font-cormorant text-2xl text-near-black font-light">
                  {item.price * item.quantity} PLN
                </p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="font-dm-sans text-xs text-secondary-text hover:text-accent tracking-widest uppercase transition-colors"
                >
                  Usuń
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="border-t border-borders pt-8 flex flex-col items-end gap-6">
          <div className="flex gap-16">
            <p className="font-dm-sans text-sm text-secondary-text tracking-widest uppercase">
              Suma
            </p>
            <p className="font-cormorant text-3xl text-near-black font-light w-48 text-right">
              {subtotal} PLN
            </p>
          </div>
          <button
            onClick={handleCheckout}
            className="font-dm-sans text-sm text-near-black border border-near-black px-12 py-3 hover:bg-near-black hover:text-warm-white transition-colors duration-300 cursor-pointer"
          >
            Przejdź do kasy
          </button>
        </div>
      </div>
    </main>
  );
}

export default Cart;
