import { useState, useEffect, useCallback } from "react";
import type { CartItem } from "../types";
import { CartContext } from "./cart-context";
import { addToCart } from "../cart/cartItems";
import { loadCart, saveCart } from "../cart/cartStorage";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  function addItem(newItem: Omit<CartItem, "quantity">) {
    // merge decision must run against prev, not the render closure — two rapid
    // clicks before a re-render would otherwise both append a fresh line (#70).
    // The returned boolean drives toast feedback only; it reflects render-time
    // state (addToCart returns the same reference when nothing would change).
    setItems((prev) => addToCart(prev, newItem));
    return addToCart(items, newItem) !== items;
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
