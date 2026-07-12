import { useState } from "react";
import { FULFILLMENT_STATUSES, FULFILLMENT_LABELS_SHORT } from "@sznyt/shared";
import type { AdminOrder } from "../../types";
import { useAuth } from "@clerk/react";
import Skeleton from "../../components/Skeleton";
import { apiFetch } from "../../lib/api";
import { useResource } from "../../hooks/useResource";

function FulfillmentCell({ order }: { order: AdminOrder }) {
  const { getToken } = useAuth();
  const [status, setStatus] = useState(order.fulfillmentStatus);
  const [tracking, setTracking] = useState(order.trackingNumber ?? "");
  const [saving, setSaving] = useState(false);

  async function save(newStatus: string, newTracking: string) {
    setSaving(true);
    try {
      await apiFetch(`/orders/${order.id}/fulfillment`, {
        method: "PATCH",
        auth: getToken,
        body: { fulfillmentStatus: newStatus, trackingNumber: newTracking },
      });
    } catch {
      // non-blocking
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-1 min-w-45">
      <select
        value={status}
        disabled={saving}
        onChange={(e) => {
          setStatus(e.target.value);
          save(e.target.value, tracking);
        }}
        className="border border-borders text-sm px-2 py-1 bg-white focus:outline-none focus:border-near-black"
      >
        {FULFILLMENT_STATUSES.map((s) => (
          <option key={s} value={s}>{FULFILLMENT_LABELS_SHORT[s]}</option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Nr przesyłki"
        value={tracking}
        onChange={(e) => setTracking(e.target.value)}
        onBlur={() => save(status, tracking)}
        className="border border-borders text-xs px-2 py-1 focus:outline-none focus:border-near-black placeholder:text-gray-400"
      />
    </div>
  );
}

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
              <td className="p-3 font-medium">#{order.id}</td>
              <td className="p-3 text-xs">{order.customerEmail ?? "—"}</td>
              <td className="p-3">{order.status}</td>
              <td className="p-3">
                <FulfillmentCell order={order} />
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
                {new Date(order.createdAt).toLocaleDateString("pl-PL")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminOrders;
