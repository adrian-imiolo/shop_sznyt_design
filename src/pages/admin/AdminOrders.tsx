import { useState, useEffect } from "react";
import type { AdminOrder } from "../../types";
import { useAuth } from "@clerk/react";
import Skeleton from "../../components/Skeleton";

function AdminOrders() {
  const { getToken } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    async function load() {
      try {
        const token = await getToken();
        const res = await fetch(`${import.meta.env.VITE_API_URL as string}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
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
              <th className="p-3 text-left">Id</th>
              <th className="p-3 text-left w-32">Stripe Session Id</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left w-16">Suma</th>
              <th className="p-3 text-left">Dostawa</th>
              <th className="p-3 text-left">Adres dostawy</th>
              <th className="p-3 text-left">Utworzono</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr className="border-b border-borders" key={i}>
                {Array.from({ length: 7 }).map((_, j) => (
                  <td className="p-3" key={j}><Skeleton className="h-5 w-full" /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

  return (
    <>
      <div className="flex flex-col items-center p-4">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Id</th>
              <th className="p-3 text-left w-32">Stripe Session Id</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left w-16">Suma</th>
              <th className="p-3 text-left">Dostawa</th>
              <th className="p-3 text-left">Adres dostawy</th>
              <th className="p-3 text-left">Utworzono</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr className="border-b border-borders" key={order.id}>
                <td className="p-3">{order.id}</td>
                <td className="p-3">{order.stripeSessionId}</td>
                <td className="p-3">{order.status}</td>
                <td className="p-3">{order.total} PLN</td>
                <td className="p-3">{order.shippingMethod ?? "—"}</td>
                <td className="p-3 text-sm">
                  {order.shippingAddress
                    ? Object.values(order.shippingAddress).filter(Boolean).join(", ")
                    : "—"}
                </td>
                <td className="p-3">
                  {new Date(order.createdAt).toLocaleDateString("pl-PL")}
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
