import { ApiError } from "../lib/api";

export const CHECKOUT_ERROR_FALLBACK = "Nie udało się przejść do płatności. Spróbuj ponownie.";

/**
 * Maps a checkout submit failure to the message shown to the customer.
 * Only ApiError messages pass through — those come from our backend and are
 * already Polish (e.g. the 409 stock error). Anything else (fetch TypeError
 * on network failure, unexpected throws) gets the Polish fallback, never the
 * browser's raw English "Failed to fetch" (#62).
 */
export function checkoutErrorMessage(err: unknown): string {
  return err instanceof ApiError && err.message ? err.message : CHECKOUT_ERROR_FALLBACK;
}
