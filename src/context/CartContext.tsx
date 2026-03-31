import { createContext, useContext, useState, useEffect } from "react";
import type { CartItem, CartContextType } from "../types";
import { useCookieConsent } from "./CookieConsentContext";

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { consent } = useCookieConsent();
  const [items, setItems] = useState<CartItem[]>(() => {
    if (localStorage.getItem("cookie_consent") === "accepted") {
      try {
        const stored = localStorage.getItem("cart");
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    if (consent === "accepted") {
      localStorage.setItem("cart", JSON.stringify(items));
    } else {
      localStorage.removeItem("cart");
    }
  }, [items, consent]);

  function addItem(newItem: Omit<CartItem, "quantity">) {
    const existing = items.find((i) => i.id === newItem.id);
    if (existing && existing.quantity >= existing.stock) return false;
    if (newItem.stock === 0) return false;
    setItems((prev) => {
      if (existing) {
        return prev.map((i) =>
          i.id === newItem.id && i.quantity < i.stock
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        );
      }
      if (newItem.stock === 0) return prev;
      return [...prev, { ...newItem, quantity: 1 }];
    });
    return true;
  }

  function removeItem(id: number) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateQuantity(id: number, quantity: number) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, totalItems }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
