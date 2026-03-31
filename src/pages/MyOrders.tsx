import { useState, useEffect } from "react";
import { RedirectToSignIn, useAuth } from "@clerk/react";
import type { Order } from "../types";
import Skeleton from "../components/Skeleton";
import { Link } from "react-router-dom";

function MyOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { userId, isLoaded } = useAuth();
  const header = (
    <div className="flex justify-between py-5 w-full bg-near-black text-xl font-dm-sans text-warm-white">
      <p className="p-6 mr-5">Zamówienia</p>
    </div>
  );
  useEffect(() => {
    if (!userId) return;
    async function load() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL as string}/orders/user/${userId}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setOrders(data);
      } catch {
        setError("Nie udało się załadować zamówień. Spróbuj ponownie.");
      }
    }
    load();
  }, [userId]);

  if (!isLoaded) return null;
  if (!userId) return <RedirectToSignIn />;

  if (!orders)
    return (
      <>
        {header}
        <div className="p-4">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left w-1/5">Nr zamówienia</th>
                <th className="p-3 text-left w-1/5">Status</th>
                <th className="p-3 text-left w-1/5">Produkty</th>
                <th className="p-3 text-left w-1/5">Suma zamówienia</th>
                <th className="p-3 text-left w-1/5">Utworzono</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((i) => (
                <tr className="border-b border-borders" key={i}>
                  <td className="p-3"><Skeleton className="h-5 w-full" /></td>
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

  if (error)
    return (
      <>
        {header}
        <div className="flex justify-center items-center min-h-screen">
          <p className="font-dm-sans text-sm text-red-600">{error}</p>
        </div>
      </>
    );

  if (orders.length === 0)
    return (
      <>
        {header}
        <div className="flex flex-col gap-8 min-h-screen w-full justify-center items-center">
          <h2 className="text-2xl text-near-black font-dm-sans">
            Nie złożono jeszcze żadnych zamówień
          </h2>
          <Link
            to="/sklep"
            className="block font-dm-sans text-sm text-near-black border border-near-black px-8 py-3 hover:bg-near-black hover:text-warm-white transition-colors duration-300"
          >
            Zobacz kolekcję
          </Link>
        </div>
      </>
    );

  return (
    <>
      {header}
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
                <td className="p-3">
                  {order.items?.map((item) => (
                    <div key={item.id} className="text-sm">
                      {item.product.name} × {item.quantity}
                    </div>
                  ))}
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
