export const ORDER_STATUSES = ["pending", "paid", "cancelled", "failed"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/**
 * Documented lifecycle sequence: received → processing → shipped → delivered.
 * The sequence is vocabulary, not enforcement — the backend validates
 * membership only, so admins can freely correct statuses (ADR-0002).
 */
export const FULFILLMENT_STATUSES = ["received", "processing", "shipped", "delivered"] as const;

export type FulfillmentStatus = (typeof FULFILLMENT_STATUSES)[number];
