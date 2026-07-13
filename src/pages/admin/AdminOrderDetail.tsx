import { useParams, Link } from "react-router-dom";
import {
  ORDER_STATUS_LABELS,
  SHIPPING_METHOD_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@sznyt/shared";
import type { AdminOrderPayload, OrderItem } from "../../types";
import Skeleton from "../../components/Skeleton";
import { useResource } from "../../hooks/useResource";
import {
  formatOrderDate,
  formatPaczkomatLine,
  formatShippingCost,
  orderShippingCost,
} from "../../orders/formatting";
import FulfillmentControls from "../../orders/FulfillmentControls";
import { ItemThumb, DELETED_PRODUCT_NAME } from "../../orders/OrderCard";

// Utilitarian admin projection of one order: everything the fulfillment flow
// needs on a single screen, controls first. The elegant customer rendering
// lives in orders/OrderCard — this page intentionally doesn't reuse it.

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-xs text-gray-500 tracking-widest uppercase mb-2">{children}</p>
  );
}

function LineItemRow({ item }: { item: OrderItem }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <ItemThumb item={item} sizeClass="w-12 h-12" />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{item.product?.name ?? DELETED_PRODUCT_NAME}</p>
        <p className="text-xs text-gray-500">
          {item.quantity} szt. × {item.price} PLN
        </p>
      </div>
      <p className="font-medium whitespace-nowrap">{item.price * item.quantity} PLN</p>
    </div>
  );
}

function AdminOrderDetail() {
  const { id } = useParams();
  const { data: order, error: loadFailed } = useResource<AdminOrderPayload>(
    `/orders/${id}`,
    { auth: true },
  );

  if (loadFailed)
    return <p className="p-4 text-red-600 font-dm-sans text-sm">Nie udało się załadować zamówienia.</p>;

  if (!order)
    return (
      <div className="p-4 max-w-2xl font-dm-sans">
        <Skeleton className="h-5 w-32 mb-6" />
        <Skeleton className="h-8 w-56 mb-2" />
        <Skeleton className="h-5 w-72 mb-8" />
        <Skeleton className="h-24 w-full mb-8" />
        <Skeleton className="h-40 w-full" />
      </div>
    );

  const address = order.shippingAddress;
  const isPaczkomat = order.shippingMethod === "paczkomat";

  return (
    <div className="p-4 max-w-2xl font-dm-sans text-sm text-near-black">
      <Link
        to="/admin/zamowienia"
        className="text-xs text-gray-500 tracking-widest uppercase hover:text-accent transition-colors mb-6 inline-block"
      >
        ← Zamówienia
      </Link>

      {/* Header */}
      <h1 className="text-xl font-medium mb-1">Zamówienie #{order.id}</h1>
      <p className="text-gray-500 mb-1">
        {formatOrderDate(order.createdAt)} · {ORDER_STATUS_LABELS[order.status] ?? order.status}
      </p>
      {order.customerEmail && <p className="text-gray-500 mb-6">{order.customerEmail}</p>}

      {/* Fulfillment controls — the reason this page exists, so they come first */}
      <div className="border border-borders p-4 mb-8">
        <SectionLabel>Realizacja</SectionLabel>
        <div className="max-w-xs">
          <FulfillmentControls
            orderId={order.id}
            fulfillmentStatus={order.fulfillmentStatus}
            trackingNumber={order.trackingNumber}
          />
        </div>
      </div>

      {/* Line items */}
      <div className="mb-8">
        <SectionLabel>Pozycje</SectionLabel>
        <div className="divide-y divide-borders border-y border-borders">
          {order.items.map((item) => (
            <LineItemRow key={item.id} item={item} />
          ))}
        </div>
        {order.shippingMethod && (
          <div className="flex justify-between pt-3">
            <span className="text-gray-500">Dostawa</span>
            <span>{formatShippingCost(orderShippingCost(order))}</span>
          </div>
        )}
        <div className="flex justify-between py-3 font-medium">
          <span>Suma</span>
          <span>{order.total} PLN</span>
        </div>
      </div>

      {/* Shipping + payment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div>
          <SectionLabel>Dostawa</SectionLabel>
          {order.shippingMethod ? (
            <div className="flex flex-col gap-0.5">
              <p className="font-medium">
                {SHIPPING_METHOD_LABELS[order.shippingMethod] ?? order.shippingMethod}
              </p>
              {isPaczkomat && address?.code && <p>{formatPaczkomatLine(address)}</p>}
              {isPaczkomat && address?.name && <p>{address.name}</p>}
            </div>
          ) : (
            <p className="text-gray-500">Brak danych</p>
          )}
        </div>

        <div>
          <SectionLabel>Płatność</SectionLabel>
          <p>
            {order.paymentMethod
              ? PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod
              : "Brak danych"}
          </p>
        </div>

        <div className="sm:col-span-2">
          <SectionLabel>Dane odbiorcy</SectionLabel>
          {address ? (
            <div className="flex flex-col gap-0.5">
              {address.firstName && <p>{address.firstName} {address.lastName}</p>}
              {address.street && <p>{address.street}</p>}
              {address.postalCode && <p>{address.postalCode} {address.city}</p>}
              {address.phone && <p>{address.phone}</p>}
              {address.email && <p>{address.email}</p>}
            </div>
          ) : (
            <p className="text-gray-500">Brak danych</p>
          )}
        </div>
      </div>

      {/* Customer note */}
      {order.note && (
        <div className="mb-8">
          <SectionLabel>Uwagi do zamówienia</SectionLabel>
          <p className="text-accent font-medium">{order.note}</p>
        </div>
      )}
    </div>
  );
}

export default AdminOrderDetail;
