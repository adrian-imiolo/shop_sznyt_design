import {
  ORDER_STATUS_LABELS,
  FULFILLMENT_LABELS,
  SHIPPING_METHOD_LABELS,
  PAYMENT_METHOD_LABELS,
  formatPln,
} from "@sznyt/shared";
import type { Order, OrderItem } from "../types";
import {
  formatOrderDate,
  formatPaczkomatLine,
  formatRecipientLine,
  formatShippingCost,
  orderShippingCost,
} from "./formatting";

/**
 * The one presentational rendering of an Order for customer surfaces.
 * Variants map to the three contexts that show an order:
 * - "summary" — the confirmation card on /sukces
 * - "list"    — one entry in the my-orders list
 * - "detail"  — the full body of the order-detail page
 * The admin table is a different projection (AdminOrder has no line items)
 * and consumes ./formatting directly instead.
 */
export type OrderCardVariant = "summary" | "list" | "detail";

// Labels come from the shared vocabulary; badge colors are presentation and stay here (ADR-0002).
const STATUS_CONFIG: Record<string, { label: string; dot: string }> = {
  paid:      { label: ORDER_STATUS_LABELS.paid,      dot: "bg-green-500" },
  pending:   { label: ORDER_STATUS_LABELS.pending,   dot: "bg-amber-400" },
  cancelled: { label: ORDER_STATUS_LABELS.cancelled, dot: "bg-red-500" },
  failed:    { label: ORDER_STATUS_LABELS.failed,    dot: "bg-red-500" },
};

const FULFILLMENT_CONFIG: Record<string, { label: string; dot: string }> = {
  received:   { label: FULFILLMENT_LABELS.received,   dot: "bg-amber-400" },
  processing: { label: FULFILLMENT_LABELS.processing, dot: "bg-blue-400" },
  shipped:    { label: FULFILLMENT_LABELS.shipped,    dot: "bg-green-500" },
  delivered:  { label: FULFILLMENT_LABELS.delivered,  dot: "bg-green-700" },
};

export const DELETED_PRODUCT_NAME = "Produkt usunięty";

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, dot: "bg-gray-400" };
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}

function FulfillmentBadge({ status, labelClassName }: { status: string; labelClassName?: string }) {
  const config = FULFILLMENT_CONFIG[status] ?? { label: status, dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-2 ${labelClassName ?? ""}`}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}

export function ItemThumb({ item, sizeClass }: { item: OrderItem; sizeClass: string }) {
  if (!item.product?.imageUrl) return <div className={`${sizeClass} bg-borders shrink-0`} />;
  return (
    <div
      className={`${sizeClass} bg-cover bg-center shrink-0`}
      style={{ backgroundImage: `url(${item.product.imageUrl})` }}
    />
  );
}

function SummaryCard({ order }: { order: Order }) {
  return (
    <div className="border border-borders p-8 flex flex-col gap-4 w-full max-w-sm">
      <div className="flex justify-between font-dm-sans text-near-black">
        <span className="text-secondary-text">Numer zamówienia</span>
        <span>#{order.id}</span>
      </div>
      <div className="flex justify-between font-dm-sans text-near-black">
        <span className="text-secondary-text">Status</span>
        <span>{ORDER_STATUS_LABELS[order.status] ?? order.status}</span>
      </div>
      <div className="flex justify-between font-dm-sans text-near-black">
        <span className="text-secondary-text">Data</span>
        <span>{formatOrderDate(order.createdAt)}</span>
      </div>

      <div className="border-t border-borders pt-4 flex flex-col gap-3">
        {order.items?.map((item) => (
          <div key={item.id} className="flex justify-between font-dm-sans text-near-black text-sm">
            <span>{item.product?.name ?? DELETED_PRODUCT_NAME} × {item.quantity}</span>
            <span>{formatPln(item.price * item.quantity)}</span>
          </div>
        ))}
        {order.shippingMethod && (
          <div className="flex justify-between font-dm-sans text-near-black text-sm">
            <span>Dostawa</span>
            <span>{formatShippingCost(orderShippingCost(order))}</span>
          </div>
        )}
      </div>

      <div className="border-t border-borders pt-4 flex justify-between font-dm-sans text-near-black font-medium">
        <span>Suma</span>
        <span>{formatPln(order.total)}</span>
      </div>
    </div>
  );
}

// Renders the list-entry *content* only — the enclosing <Link> in MyOrders
// owns the layout (flex, gap) and the `group` class the hover states key on.
function ListItem({ order }: { order: Order }) {
  const address = order.shippingAddress;
  const isPaczkomat = order.shippingMethod === "paczkomat";

  return (
    <>
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-0">
        <div>
          <p className="font-cormorant text-2xl text-near-black font-light group-hover:text-accent transition-colors">
            Zamówienie #{order.id}
          </p>
          <p className="font-dm-sans text-sm text-secondary-text mt-1">
            {formatOrderDate(order.createdAt)} · <StatusBadge status={order.status} />
          </p>
          <FulfillmentBadge
            status={order.fulfillmentStatus}
            labelClassName="font-dm-sans text-sm text-secondary-text mt-0.5"
          />
        </div>
        <p className="font-cormorant text-2xl text-near-black font-light">
          {formatPln(order.total)}
        </p>
      </div>

      {/* Products */}
      {order.items && order.items.length > 0 && (
        <div className="flex flex-col gap-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <ItemThumb item={item} sizeClass="w-10 h-10" />
              <p className="font-dm-sans text-sm text-secondary-text">
                {item.product?.name ?? DELETED_PRODUCT_NAME}{" "}
                <span className="text-near-black">× {item.quantity}</span>
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Shipping */}
      {order.shippingMethod && (
        <div className="flex flex-col gap-1">
          <p className="font-dm-sans text-xs text-accent tracking-[0.2em] uppercase">
            {SHIPPING_METHOD_LABELS[order.shippingMethod] ?? order.shippingMethod}
          </p>
          {address && (
            <p className="font-dm-sans text-sm text-near-black">
              {isPaczkomat ? formatPaczkomatLine(address) : formatRecipientLine(address)}
            </p>
          )}
        </div>
      )}

      {/* Order note */}
      {order.note && (
        <p className="font-dm-sans text-sm text-near-black">
          <span className="text-secondary-text">Uwagi:</span> {order.note}
        </p>
      )}

      <p className="font-dm-sans text-xs text-secondary-text tracking-widest uppercase group-hover:text-accent transition-colors self-end">
        Szczegóły →
      </p>
    </>
  );
}

function DetailBody({ order }: { order: Order }) {
  const address = order.shippingAddress;

  return (
    <>
      <h1 className="font-cormorant text-3xl md:text-5xl text-near-black font-light mb-2">
        Zamówienie #{order.id}
      </h1>
      <p className="font-dm-sans text-sm text-secondary-text mb-4">
        {formatOrderDate(order.createdAt)} · <StatusBadge status={order.status} />
      </p>
      <div className="flex flex-col gap-1 mb-12">
        <FulfillmentBadge
          status={order.fulfillmentStatus}
          labelClassName="font-dm-sans text-sm text-near-black"
        />
        {order.trackingNumber && (
          <p className="font-dm-sans text-xs text-secondary-text">
            Nr przesyłki: <span className="text-near-black font-medium">{order.trackingNumber}</span>
          </p>
        )}
      </div>

      {/* Products */}
      <div className="flex flex-col divide-y divide-borders mb-12">
        {order.items?.map((item) => (
          <div key={item.id} className="flex gap-4 md:gap-6 py-6 items-center">
            <ItemThumb item={item} sizeClass="w-14 h-14 md:w-20 md:h-20" />
            <div className="flex-1 min-w-0">
              <p className="font-cormorant text-lg md:text-xl text-near-black font-light">
                {item.product?.name ?? DELETED_PRODUCT_NAME}
              </p>
              <p className="font-dm-sans text-sm text-secondary-text">
                {item.quantity} szt. × {formatPln(item.price)}
              </p>
            </div>
            <p className="font-cormorant text-lg md:text-xl text-near-black font-light w-20 md:w-28 text-right">
              {formatPln(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10">
        {/* Payment method */}
        {order.paymentMethod && (
          <div className="sm:col-span-2">
            <p className="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase mb-4">
              Płatność
            </p>
            <p className="font-dm-sans text-sm text-near-black font-medium">
              {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
            </p>
          </div>
        )}

        {/* Shipping info */}
        <div>
          <p className="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase mb-4">
            Dostawa
          </p>
          {order.shippingMethod ? (
            <div className="font-dm-sans text-sm text-near-black flex flex-col gap-1">
              <p className="font-medium">{SHIPPING_METHOD_LABELS[order.shippingMethod] ?? order.shippingMethod}</p>
              {order.shippingMethod === "paczkomat" && address?.code && (
                <p>{formatPaczkomatLine(address)}</p>
              )}
              {order.shippingMethod !== "paczkomat" && address && (
                <>
                  {address.street && <p>{address.street}</p>}
                  {address.postalCode && <p>{address.postalCode} {address.city}</p>}
                </>
              )}
            </div>
          ) : (
            <p className="font-dm-sans text-sm text-secondary-text">Brak danych</p>
          )}
        </div>

        {/* Address */}
        <div>
          <p className="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase mb-4">
            Dane odbiorcy
          </p>
          {address ? (
            <div className="font-dm-sans text-sm text-near-black flex flex-col gap-1">
              {address.firstName && <p>{address.firstName} {address.lastName}</p>}
              {address.street && <p>{address.street}</p>}
              {address.postalCode && <p>{address.postalCode} {address.city}</p>}
              {address.phone && <p>{address.phone}</p>}
            </div>
          ) : (
            <p className="font-dm-sans text-sm text-secondary-text">Brak danych</p>
          )}
        </div>

        {/* Order note */}
        {order.note && (
          <div className="sm:col-span-2">
            <p className="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase mb-4">
              Uwagi do zamówienia
            </p>
            <p className="font-dm-sans text-sm text-near-black">{order.note}</p>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="border-t border-borders mt-10 pt-6 flex flex-col gap-3">
        {order.shippingMethod && (
          <div className="flex justify-between items-center">
            <p className="font-dm-sans text-sm text-secondary-text tracking-widest uppercase">Dostawa</p>
            <p className="font-dm-sans text-sm text-near-black">
              {formatShippingCost(orderShippingCost(order))}
            </p>
          </div>
        )}
        <div className="flex justify-between items-center">
          <p className="font-dm-sans text-sm text-secondary-text tracking-widest uppercase">Suma</p>
          <p className="font-cormorant text-3xl text-near-black font-light">{formatPln(order.total)}</p>
        </div>
      </div>
    </>
  );
}

function OrderCard({ order, variant }: { order: Order; variant: OrderCardVariant }) {
  if (variant === "summary") return <SummaryCard order={order} />;
  if (variant === "list") return <ListItem order={order} />;
  return <DetailBody order={order} />;
}

export default OrderCard;
