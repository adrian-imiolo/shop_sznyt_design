import { useState, useEffect } from "react";
import { RedirectToSignIn, useAuth } from "@clerk/react";
import type { Order } from "../types";
import Skeleton from "../components/Skeleton";

function MyOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const { userId } = useAuth();

  useEffect(() => {
    async function load() {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      const res = await fetch(`http://localhost:3000/orders/user/${userId}`);
      const data = await res.json();
      setOrders(data);
    }
    load();
  }, [userId]);

  if (!userId) return <RedirectToSignIn />;

  if (!orders)
    return (
      <>
        <div className="flex justify-between py-5 w-full bg-near-black text-xl font-dm-sans text-warm-white">
          <p className="p-6 mr-5">Zamówienia</p>
        </div>
        <div className="p-4">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left w-1/4">Nr zamówienia</th>
                <th className="p-3 text-left w-1/4">Status</th>
                <th className="p-3 text-left w-1/4">Suma zamówienia</th>
                <th className="p-3 text-left w-1/4">Utworzono</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((i) => (
                <tr className="border-b border-borders" key={i}>
                  <td className="p-3"><Skeleton className="h-5 w-full" /></td>
                  <td className="p-3"><Skeleton className="h-5 w-full" /></td>
                  <td className="p-3"><Skeleton className="h-5 w-full" /></td>
                  <td className="p-3"><Skeleton className="h-5 w-full" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );

  return (
    <>
      <div className="flex justify-between py-5 w-full bg-near-black text-xl font-dm-sans text-warm-white">
        <p className="p-6 mr-5">Zamówienia</p>
      </div>
      <div className="p-4">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left w-1/4">Nr zamówienia</th>
              <th className="p-3 text-left w-1/4">Status</th>
              <th className="p-3 text-left w-1/4">Suma zamówienia</th>
              <th className="p-3 text-left w-1/4">Utworzono</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr className="border-b border-borders" key={order.id}>
                <td className="p-3">{order.id}</td>
                <td className="p-3">
                  {order.status === "paid" ? "Opłacone" : order.status}
                </td>
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

export default MyOrders;
