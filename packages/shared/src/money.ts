const NBSP = "\u00A0";

/**
 * Canonical money rendering for every surface (shop, cart, orders, admin,
 * emails): comma decimal separator, non-breaking spaces (U+00A0), `PLN`
 * suffix. Whole amounts drop the decimal part; fractional amounts show
 * exactly two. Input is PLN (not grosze). Hand-rolled instead of `Intl` so
 * Node and browsers produce byte-identical output regardless of ICU data.
 */
export function formatPln(amount: number): string {
  const grosze = Math.round(amount * 100);
  const isWhole = grosze % 100 === 0;
  const [whole, fraction = ""] = (grosze / 100).toFixed(isWhole ? 0 : 2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+$)/g, NBSP);
  return `${grouped}${fraction && `,${fraction}`}${NBSP}PLN`;
}
