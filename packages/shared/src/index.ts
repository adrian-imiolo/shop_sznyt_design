export { ORDER_STATUSES, FULFILLMENT_STATUSES } from "./statuses.ts";
export type { OrderStatus, FulfillmentStatus } from "./statuses.ts";
export {
  ORDER_STATUS_LABELS,
  FULFILLMENT_LABELS,
  FULFILLMENT_LABELS_SHORT,
  SHIPPING_METHOD_LABELS,
  PAYMENT_METHOD_LABELS,
  FREE_SHIPPING_LABEL,
} from "./labels.ts";
export {
  SHIPPING_METHODS,
  isShippingMethod,
  SHIPPING_COSTS,
  FREE_SHIPPING_THRESHOLD,
  calcShippingCost,
  deriveShippingCost,
} from "./shipping.ts";
export type { ShippingMethod } from "./shipping.ts";
export type { ShippingAddress } from "./shippingAddress.ts";
export { ORDER_NOTE_MAX_LENGTH } from "./orderNote.ts";
export { REVENUE_THRESHOLDS } from "./revenue.ts";
export type { QuarterRevenue, QuarterRevenueThreshold } from "./revenue.ts";
