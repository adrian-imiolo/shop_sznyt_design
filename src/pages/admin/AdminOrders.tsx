import { useState, useEffect } from "react";
import type { AdminOrder } from "../../types";
import { useAuth } from "@clerk/react";
import Skeleton from "../../components/Skeleton";

const FULFILLMENT_LABELS: Record<string, string> = {
  received: "Przyjęte",
  processing: "W realizacji",
  shipped: "Wysłane",
  delivered: "Dostarczone",
};

const FULFILLMENT_OPTIONS = ["received", "processing", "shipped", "delivered"];

function FulfillmentCell({ order, token }: { order: AdminOrder; token: string }) {
  const [status, setStatus] = useState(order.fulfillmentStatus);
  const [tracking, setTracking] = useState(order.trackingNumber ?? "");
  const [saving, setSaving] = useState(false);

  async function save(newStatus: string, newTracking: string) {
    setSaving(true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL as string}/orders/${order.id}/fulfillment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fulfillmentStatus: newStatus, trackingNumber: newTracking }),
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
        {FULFILLMENT_OPTIONS.map((s) => (
          <option key={s} value={s}>{FULFILLMENT_LABELS[s]}</option>
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
  const { getToken } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const t = await getToken();
        setToken(t);
        const res = await fetch(`${import.meta.env.VITE_API_URL as string}/orders`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setOrders(data);
      } catch {
        setError("Nie udało się załadować zamówień.");
      }
    }
    load();
  }, []);

  if (error) return <p className="p-4 text-red-600 font-dm-sans text-sm">{error}</p>;

  if (!orders)
    return (
      <div className="flex flex-col items-center p-4">
        <table className="w-full border-collapse">
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
                <FulfillmentCell order={order} token={token!} />
              </td>
              <td className="p-3">{order.total} PLN</td>
              <td className="p-3">{order.shippingMethod ?? "—"}</td>
              <td className="p-3 text-xs max-w-40">
                {order.shippingAddress
                  ? Object.values(order.shippingAddress).filter(Boolean).join(", ")
                  : "—"}
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
