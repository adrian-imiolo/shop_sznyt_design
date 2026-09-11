import { useEffect, useState } from "react";
import { useCart } from "../hooks/useCart";
import { showBriefly } from "../lib/showBriefly";

const TOAST_MS = 3000;

/** Presentation only — exported so the markup is testable without effects. */
export function CartToast({ visible }: { visible: boolean }) {
  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-near-black text-warm-white font-dm-sans text-sm px-6 py-4 flex items-center gap-3 transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      <span className="text-accent">✓</span>
      <p>Dodano do koszyka!</p>
    </div>
  );
}

/**
 * The one add-to-cart toast for the whole app — mounted once in ShopLayout, not
 * once per product card. It listens to the cart's `lastAdd` counter rather than
 * to a return value from `addItem`, so it only ever announces adds that actually
 * landed (#167).
 *
 * Returning `showBriefly`'s cleanup is what keeps a re-add honest: React cancels
 * the pending hide before re-running the effect, so the second add gets a full
 * window instead of inheriting the first one's deadline.
 */
function CartFeedback() {
  const { lastAdd } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (lastAdd === 0) return;

    return showBriefly(setVisible, TOAST_MS);
  }, [lastAdd]);

  return <CartToast visible={visible} />;
}

export default CartFeedback;
