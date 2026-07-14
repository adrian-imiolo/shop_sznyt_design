/** seed.js product 1 — the item both flows buy and display. */
export const SEED_PRODUCT = { id: 1, name: "Ramka Szachownica", price: 299 };

/** inpost_kurier, below the 350 PLN free-shipping threshold. */
export const COURIER_SHIPPING_COST = 25;

export const ORDER_TOTAL = SEED_PRODUCT.price + COURIER_SHIPPING_COST;

/** Checkout address (sans email — each spec supplies its own identity). */
export const E2E_ADDRESS = {
  firstName: "E2E",
  lastName: "Tester",
  street: "Testowa 1",
  postalCode: "00-001",
  city: "Warszawa",
  phone: "500600700",
};
