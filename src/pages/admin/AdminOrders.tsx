import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
type Orders = {
  id: number;
  stripeSessionId: string;
  status: string;
  total: number;
  createdAt: string;
};

function AdminOrders() {
  const [orders, setOrders] = useState<Orders[] | null>(null);
  useEffect(() => {
    async function load() {
      const res = await fetch("http://localhost:3000/orders");
      const data = await res.json();
      setOrders(data);
    }
    load();
  }, []);

  if (!orders) return <p>Ładowanie...</p>;

  return (
    <>
      <div className="flex justify-between py-5 w-full bg-near-black text-xl font-dm-sans text-warm-white">
        <Link to="/admin" className="p-6">
          Panel admina
        </Link>
        <p className="p-6 mr-5">Zamówienia</p>
      </div>
      <div className="p-4">
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
