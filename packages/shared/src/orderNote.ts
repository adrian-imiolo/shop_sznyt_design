/**
 * Max length of the customer order note ("Uwagi do zamówienia").
 * Travels through Stripe session metadata, whose per-value hard cap is 500
 * characters — 300 leaves margin and keeps the note readable in the admin
 * table and emails. Enforced server-side at checkout; the Cart textarea
 * mirrors it via maxLength + counter.
 */
export const ORDER_NOTE_MAX_LENGTH = 300;
