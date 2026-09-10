/** The seven writable product fields, as the form holds them — all strings. */
export type ProductFormValues = {
  name: string;
  tagline: string;
  description: string;
  price: string;
  imageUrl: string;
  lifestyleImageUrl: string;
  stock: string;
};

/** Per-field format errors — gate submit and drive inline error display. */
export type ProductFieldErrors = Partial<Record<keyof ProductFormValues, string>>;

/** What the API accepts: the same fields with price and stock parsed. */
export type ProductPayload = Omit<ProductFormValues, "price" | "stock"> & {
  price: number;
  stock: number;
};

export type ProductValidation =
  | { ok: true; payload: ProductPayload }
  | { ok: false; fieldErrors: ProductFieldErrors };

export function validateProductForm(values: ProductFormValues): ProductValidation {
  const fieldErrors: ProductFieldErrors = {};

  const price = Number(values.price.replace(",", "."));
  if (!Number.isFinite(price)) fieldErrors.price = "Podaj cenę jako liczbę, np. 149,99";
  else if (price <= 0) fieldErrors.price = "Cena musi być większa od zera";

  const stock = Number(values.stock);
  if (!Number.isInteger(stock) || stock < 0) {
    fieldErrors.stock = "Podaj ilość jako liczbę całkowitą, zero lub więcej";
  }

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  return { ok: true, payload: { ...values, price, stock } };
}
