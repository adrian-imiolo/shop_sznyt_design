import type Stripe from "stripe";
import type { CartItemInput, CheckoutProduct } from "./types.ts";
import { SHIPPING_COSTS, SHIPPING_METHOD_LABELS, FREE_SHIPPING_THRESHOLD } from "@sznyt/shared";

export type BuildCheckoutResult =
  | {
      ok: true;
      lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
      subtotal: number;
      shippingCost: number;
    }
  | { ok: false; status: 400 | 409; error: string };

/**
 * Stripe requires image URLs to be absolute and publicly reachable; the DB
 * stores deployment-agnostic relative paths, so relative urls get the
 * frontend origin prefixed here. Without a frontendUrl the image is dropped —
 * a missing thumbnail beats a rejected checkout session.
 */
function toStripeImageUrl(
  imageUrl: string | null,
  frontendUrl: string | undefined,
): string | null {
  if (!imageUrl) return null;
  if (!imageUrl.startsWith("/")) return imageUrl;
  if (!frontendUrl) return null;
  return `${frontendUrl.replace(/\/$/, "")}${imageUrl}`;
}

/**
 * Server-authoritative checkout pricing: prices, names and images come from
 * the DB — the client only chooses ids and quantities. Each product line is
 * stamped with metadata.productId (the line-item contract); the shipping
 * line carries no productId so order intake skips it for stock decrement.
 */
export function buildCheckoutLineItems(
  items: unknown,
  products: CheckoutProduct[],
  shippingMethod: unknown,
  frontendUrl?: string,
): BuildCheckoutResult {
  if (typeof shippingMethod !== "string" || !SHIPPING_COSTS[shippingMethod]) {
    return { ok: false, status: 400, error: "Wybierz metodę dostawy" };
  }

  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, status: 400, error: "Koszyk jest pusty" };
  }

  const productsById = new Map(products.map((p) => [p.id, p]));

  const orderLines: { product: CheckoutProduct; quantity: number }[] = [];
  for (const item of items as CartItemInput[]) {
    const product = productsById.get(Number(item.id));
    const quantity = Number(item.quantity);
    if (!product || !Number.isInteger(quantity) || quantity < 1) {
      return { ok: false, status: 400, error: "Nieprawidłowy produkt w koszyku" };
    }
    if (quantity > product.stock) {
      return {
        ok: false,
        status: 409,
        error: `Niewystarczająca ilość produktu „${product.name}" — dostępne sztuki: ${product.stock}`,
      };
    }
    orderLines.push({ product, quantity });
  }

  const subtotal = orderLines.reduce(
    (sum, line) => sum + line.product.price * line.quantity,
    0,
  );
  const shippingCost =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COSTS[shippingMethod];

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
    orderLines.map(({ product, quantity }) => {
      const imageUrl = toStripeImageUrl(product.imageUrl, frontendUrl);
      return {
        price_data: {
          currency: "pln",
          product_data: {
            name: product.name,
            ...(imageUrl ? { images: [imageUrl] } : {}),
            metadata: { productId: String(product.id) },
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity,
      };
    });

  if (shippingCost > 0) {
    lineItems.push({
      price_data: {
        currency: "pln",
        product_data: {
          name: `Dostawa — ${SHIPPING_METHOD_LABELS[shippingMethod]}`,
          metadata: {},
        },
        unit_amount: shippingCost * 100,
      },
      quantity: 1,
    });
  }

  return { ok: true, lineItems, subtotal, shippingCost };
}
