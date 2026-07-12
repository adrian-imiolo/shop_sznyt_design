import { Link } from "react-router-dom";
import type { AdminOrder } from "../../types";
import Skeleton from "../../components/Skeleton";
import { useResource } from "../../hooks/useResource";
import { formatOrderDate } from "../../orders/formatting";
import FulfillmentControls from "../../orders/FulfillmentControls";

function AdminOrders() {
  const { data: orders, error: loadFailed } = useResource<AdminOrder[]>("/orders", { auth: true });
  const error = loadFailed ? "Nie udało się załadować zamówień." : null;

  if (error) return <p className="p-4 text-red-600 font-dm-sans text-sm">{error}</p>;

  if (!orders)
    return (
      <div className="p-4 overflow-x-auto">
        <table className="w-full border-collapse min-w-[900px]">
          <thead className="bg-gray-100">
            <tr>
              {["Id", "Email", "Status płatności", "Realizacja", "Suma", "Dostawa", "Adres", "Data"].map((h) => (
                <th key={h} className="p-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr className="border-b border-borders" key={i}>
                {Array.from({ length: 8 }).map((_, j) => (
                  <td className="p-3" key={j}><Skeleton className="h-5 w-full" /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

  return (
    <div className="p-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Id</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Status płatności</th>
            <th className="p-3 text-left">Realizacja</th>
            <th className="p-3 text-left">Suma</th>
            <th className="p-3 text-left">Dostawa</th>
            <th className="p-3 text-left">Adres</th>
            <th className="p-3 text-left">Data</th>
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
                {order.shippingAddress
                  ? Object.values(order.shippingAddress).filter(Boolean).join(", ")
                  : "—"}
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
  );
}

export default AdminOrders;
