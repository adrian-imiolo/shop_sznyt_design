import { useState, useEffect } from "react";
import { RedirectToSignIn, useAuth } from "@clerk/react";

type Orders = {
  id: number;
  status: string;
  total: number;
  createdAt: string;
};

function MyOrders() {
  const [orders, setOrders] = useState<Orders[] | null>(null);
  const { userId } = useAuth();

  useEffect(() => {
    async function load() {
      const res = await fetch(`http://localhost:3000/orders/user/${userId}`);
      const data = await res.json();
      setOrders(data);
    }
    load();
  }, [userId]);

  if (!userId) return <RedirectToSignIn />;

  if (!orders) return <p>Ładowanie...</p>;

  return (
    <>
      <div className="flex justify-between py-5 w-full bg-near-black text-xl font-dm-sans text-warm-white">
        <p className="p-6 mr-5">Zamówienia</p>
      </div>
      <div className="p-4">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Id</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left w-16">Suma zamówienia</th>
              <th className="p-3 text-left">Utworzono</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr className="border-b border-borders" key={order.id}>
                <td className="p-3">{order.id}</td>
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

export default MyOrders;
