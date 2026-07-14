import { useState } from "react";
import { Link } from "react-router-dom";
import type { AdminOrder } from "../../types";
import Skeleton from "../../components/Skeleton";
import { useResource } from "../../hooks/useResource";
import { formatOrderDate } from "../../orders/formatting";
import FulfillmentControls from "../../orders/FulfillmentControls";

const ORDER_COLUMNS = ["Id", "Email", "Status płatności", "Realizacja", "Suma", "Dostawa", "Adres", "Data"];

function addressLine(order: AdminOrder) {
  return order.shippingAddress
    ? Object.values(order.shippingAddress).filter(Boolean).join(", ")
    : "—";
}

/** One collapsed line by default; tap toggles the full address (card view only). */
function ExpandableAddress({ order }: { order: AdminOrder }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setExpanded(!expanded)}
      aria-expanded={expanded}
      className={`block w-full text-left text-xs py-1 cursor-pointer ${expanded ? "" : "truncate"}`}
    >
      {addressLine(order)}
    </button>
  );
}

function AdminOrders() {
  const { data: orders, error: loadFailed } = useResource<AdminOrder[]>("/orders", { auth: true });
  const error = loadFailed ? "Nie udało się załadować zamówień." : null;

  if (error) return <p className="p-4 text-red-600 font-dm-sans text-sm">{error}</p>;

  if (!orders)
    return (
      <>
        <div className="p-4 space-y-4 md:hidden">
          {[1, 2, 3].map((i) => (
            <div className="border border-borders p-4 space-y-2" key={i}>
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
        <div className="p-4 overflow-x-auto hidden md:block">
          <table className="w-full border-collapse min-w-[900px]">
            <thead className="bg-gray-100">
              <tr>
                {ORDER_COLUMNS.map((h) => (
                  <th key={h} className="p-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((i) => (
                <tr className="border-b border-borders" key={i}>
                  {ORDER_COLUMNS.map((h) => (
                    <td className="p-3" key={h}><Skeleton className="h-5 w-full" /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );

  return (
    <>
      <div className="p-4 space-y-4 text-sm md:hidden">
        {orders.map((order) => (
          <article className="border border-borders p-4 space-y-2" key={order.id}>
            <div className="flex items-center justify-between gap-2">
              <Link
                to={`/admin/zamowienia/${order.id}`}
                className="font-medium underline underline-offset-2 hover:text-accent transition-colors"
              >
                #{order.id}
              </Link>
              <span className="text-xs">{formatOrderDate(order.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span>{order.status}</span>
              <span className="text-xs truncate">{order.customerEmail ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{order.total} PLN</span>
              <span className="text-xs">{order.shippingMethod ?? "—"}</span>
            </div>
            <ExpandableAddress order={order} />
            {order.note && (
              <p className="text-xs text-accent font-medium">Uwagi: {order.note}</p>
            )}
            <FulfillmentControls
              orderId={order.id}
              fulfillmentStatus={order.fulfillmentStatus}
              trackingNumber={order.trackingNumber}
            />
          </article>
        ))}
      </div>
      <div className="p-4 overflow-x-auto hidden md:block">
        <table className="w-full border-collapse text-sm min-w-[900px]">
          <thead className="bg-gray-100">
            <tr>
              {ORDER_COLUMNS.map((h) => (
                <th key={h} className="p-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr className="border-b border-borders align-top" key={order.id}>
                <td className="p-3 font-medium">
                  <Link
                    to={`/admin/zamowienia/${order.id}`}
                    className="underline underline-offset-2 hover:text-accent transition-colors"
                  >
                    #{order.id}
                  </Link>
                </td>
                <td className="p-3 text-xs">{order.customerEmail ?? "—"}</td>
                <td className="p-3">{order.status}</td>
                <td className="p-3">
                  <FulfillmentControls
                    orderId={order.id}
                    fulfillmentStatus={order.fulfillmentStatus}
                    trackingNumber={order.trackingNumber}
                  />
                </td>
                <td className="p-3">{order.total} PLN</td>
                <td className="p-3">{order.shippingMethod ?? "—"}</td>
                <td className="p-3 text-xs max-w-40">
                  {addressLine(order)}
                  {order.note && (
                    <p className="mt-1 text-accent font-medium">Uwagi: {order.note}</p>
                  )}
                </td>
                <td className="p-3 whitespace-nowrap">
                  {formatOrderDate(order.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default AdminOrders;
