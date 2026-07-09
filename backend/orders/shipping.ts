export const SHIPPING_COSTS: Record<string, number> = {
  paczkomat: 20,
  inpost_kurier: 25,
  dpd: 25,
};

export const FREE_SHIPPING_THRESHOLD = 350;

export const SHIPPING_LABELS: Record<string, string> = {
  paczkomat: "InPost Paczkomat",
  inpost_kurier: "InPost Kurier",
  dpd: "DPD Kurier",
};
