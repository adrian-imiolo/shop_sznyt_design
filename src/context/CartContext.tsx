import { useState, useEffect, useCallback } from "react";
import type { CartItem } from "../types";
import { CartContext } from "./cart-context";
import { addItemToState, type CartState } from "../cart/cartItems";
import { loadCart, saveCart } from "../cart/cartStorage";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartState>(() => ({
    items: loadCart(),
    lastAdd: 0,
  }));
  const { items, lastAdd } = cart;

  useEffect(() => {
    saveCart(items);
  }, [items]);

  // Every decision runs against prev, never the render closure: two rapid
  // clicks would otherwise both read the same stale cart — appending a
  // duplicate line (#70) or reporting a success the stock guard rejected (#167).
  function addItem(newItem: Omit<CartItem, "quantity">) {
    setCart((prev) => addItemToState(prev, newItem));
  }

  function removeItem(id: number) {
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id),
    }));
  }

  function updateQuantity(id: number, quantity: number) {
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
    }));
  }

  // stable identity — consumed by effects (e.g. OrderSuccess clears the cart once paid)
  const clearCart = useCallback(() => {
    setCart((prev) => (prev.items.length === 0 ? prev : { ...prev, items: [] }));
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        lastAdd,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
