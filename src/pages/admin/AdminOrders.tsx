import { useState, useEffect } from "react";
import type { AdminOrder } from "../../types";

function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL as string}/orders`);
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
  if (!orders) return <p>Ładowanie...</p>;

  return (
    <>
      <div className="flex flex-col items-center p-4">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Id</th>
              <th className="p-3 text-left w-32">Stripe Session Id</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left w-16">Suma zamówienia</th>
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
