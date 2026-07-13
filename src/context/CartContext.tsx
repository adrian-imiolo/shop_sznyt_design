import { useState, useEffect, useCallback } from "react";
import type { CartItem } from "../types";
import { CartContext } from "./cart-context";
import { addToCart, mergeDuplicateItems } from "../cart/cartItems";
import { useCookieConsent } from "../hooks/useCookieConsent";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { consent } = useCookieConsent();
  const [items, setItems] = useState<CartItem[]>(() => {
    if (localStorage.getItem("cookie_consent") === "accepted") {
      try {
        const stored = localStorage.getItem("cart");
        // merge, not just parse — carts saved before #70 may hold duplicate lines
        return stored ? mergeDuplicateItems(JSON.parse(stored)) : [];
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
    // merge decision must run against prev, not the render closure — two rapid
    // clicks before a re-render would otherwise both append a fresh line (#70)
    setItems((prev) => addToCart(prev, newItem));
    return true;
  }

  function removeItem(id: number) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateQuantity(id: number, quantity: number) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  }

  // stable identity — consumed by effects (e.g. OrderSuccess clears the cart once paid)
  const clearCart = useCallback(() => {
    setItems((prev) => (prev.length === 0 ? prev : []));
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems }}
    >
      {children}
    </CartContext.Provider>
  );
}
