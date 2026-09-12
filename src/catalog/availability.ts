/**
 * Availability rules for the storefront.
 *
 * The sold-out state (see CONTEXT.md) is derived from the catalog, never
 * flagged: raising one product's stock in the admin ends it and resetting
 * to 0 restores it, with nothing else to flip and nothing that can drift out
 * of step with what the shop will actually sell.
 */

export type Stocked = { stock: number };

/** Sold-out state: a non-empty catalog in which no product has stock. */
export function isSoldOut(products: readonly Stocked[]): boolean {
  return products.length > 0 && products.every((product) => product.stock <= 0);
}

/** The product page's availability line. */
export function availabilityLabel(stock: number): string {
  return stock > 0 ? `${stock} szt.` : "Wyprzedane";
}

/** Whether the add-to-cart button does anything: stock exists and the cart has not taken all of it. */
export function canAddToCart(stock: number, cartQuantity: number): boolean {
  return stock > 0 && cartQuantity < stock;
}

/**
 * The add-to-cart button's label. A product with no stock says so; one the
 * cart has already filled to its stock says that instead. The two used to
 * share "Maksymalna ilość w koszyku", which is wrong for a sold-out product.
 */
export function addToCartLabel(stock: number, cartQuantity: number): string {
  if (stock <= 0) return "Wyprzedane";
  if (cartQuantity >= stock) return "Maksymalna ilość w koszyku";
  return "Dodaj do koszyka";
}
