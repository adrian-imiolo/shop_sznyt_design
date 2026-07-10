// Polish label dictionaries — the single source for user-facing order wording.
// Typed loosely (Record<string, string>) because every consumer indexes with
// values that are strings at the trust boundary (API JSON, Stripe metadata)
// and applies its own fallback.

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Oczekuje na płatność",
  paid: "Opłacone",
  cancelled: "Anulowane",
  failed: "Nieudane",
};

export const FULFILLMENT_LABELS: Record<string, string> = {
  received: "Zamówienie przyjęte",
  processing: "W realizacji",
  shipped: "Wysłane",
  delivered: "Dostarczone",
};

/** Compact variant for tight admin UI (375 px) — kept beside the full form so the two can't drift. */
export const FULFILLMENT_LABELS_SHORT: Record<string, string> = {
  received: "Przyjęte",
  processing: "W realizacji",
  shipped: "Wysłane",
  delivered: "Dostarczone",
};

export const SHIPPING_METHOD_LABELS: Record<string, string> = {
  paczkomat: "InPost Paczkomat",
  inpost_kurier: "InPost Kurier",
  dpd: "DPD Kurier",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  card: "Karta płatnicza",
  p24: "Przelewy24",
  blik: "BLIK",
};
