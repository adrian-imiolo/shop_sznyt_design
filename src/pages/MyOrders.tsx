import { useState, useEffect } from "react";
import { RedirectToSignIn, useAuth } from "@clerk/react";
import type { Order } from "../types";
import Skeleton from "../components/Skeleton";
import { Link } from "react-router-dom";

const SHIPPING_LABELS: Record<string, string> = {
  paczkomat: "InPost Paczkomat",
  inpost_kurier: "InPost Kurier",
  dpd: "DPD Kurier",
};

function MyOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { userId, isLoaded, getToken } = useAuth();

  useEffect(() => {
    if (!userId) return;
    async function load() {
      try {
        const token = await getToken();
        const res = await fetch(`${import.meta.env.VITE_API_URL as string}/orders/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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

  if (error)
    return (
      <main className="min-h-screen bg-warm-white px-6 py-16 flex justify-center items-center">
        <p className="font-dm-sans text-sm text-red-600">{error}</p>
      </main>
    );

  if (!orders)
    return (
      <main className="min-h-screen bg-warm-white px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-cormorant text-5xl text-near-black font-light mb-12">
            Moje zamówienia
          </h1>
          <div className="flex flex-col divide-y divide-borders">
            {[1, 2, 3].map((i) => (
              <div key={i} className="py-8 flex flex-col gap-3">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-52" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );

  if (orders.length === 0)
    return (
      <main className="min-h-screen bg-warm-white px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-cormorant text-5xl text-near-black font-light mb-12">
            Moje zamówienia
          </h1>
          <p className="font-dm-sans text-sm text-secondary-text mb-8">
            Nie złożono jeszcze żadnych zamówień.
          </p>
          <Link
            to="/sklep"
            className="font-dm-sans text-sm text-near-black border border-near-black px-8 py-3 hover:bg-near-black hover:text-warm-white transition-colors duration-300"
          >
            Zobacz kolekcję
          </Link>
        </div>
      </main>
    );

  return (
    <main className="min-h-screen bg-warm-white px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-cormorant text-5xl text-near-black font-light mb-12">
          Moje zamówienia
        </h1>

        <div className="flex flex-col divide-y divide-borders">
          {orders.map((order) => {
            const address = order.shippingAddress;
            const isPaczkomat = order.shippingMethod === "paczkomat";

            return (
              <Link
                key={order.id}
                to={`/moje-zamowienia/${order.id}`}
                className="py-8 flex flex-col gap-4 group"
              >
                {/* Header row */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-cormorant text-2xl text-near-black font-light group-hover:text-accent transition-colors">
                      Zamówienie #{order.id}
                    </p>
                    <p className="font-dm-sans text-sm text-secondary-text mt-1">
                      {new Date(order.createdAt).toLocaleDateString("pl-PL")} ·{" "}
                      {order.status === "paid" ? "Opłacone" : order.status}
                    </p>
                  </div>
                  <p className="font-cormorant text-2xl text-near-black font-light">
                    {order.total} PLN
                  </p>
                </div>

                {/* Products */}
                {order.items && order.items.length > 0 && (
                  <div className="flex flex-col gap-1">
                    {order.items.map((item) => (
                      <p key={item.id} className="font-dm-sans text-sm text-secondary-text">
                        {item.product?.name ?? "Produkt usunięty"} × {item.quantity}
                      </p>
                    ))}
                  </div>
                )}

                {/* Shipping */}
                {order.shippingMethod && (
                  <div className="flex flex-col gap-1">
                    <p className="font-dm-sans text-xs text-accent tracking-[0.2em] uppercase">
                      {SHIPPING_LABELS[order.shippingMethod] ?? order.shippingMethod}
                    </p>
                    {address && (
                      <>
                        {isPaczkomat ? (
                          <p className="font-dm-sans text-sm text-near-black">
                            Paczkomat: {address.code}
                            {address.city ? `, ${address.city}` : ""}
                          </p>
                        ) : (
                          <p className="font-dm-sans text-sm text-near-black">
                            {[
                              address.firstName && address.lastName
                                ? `${address.firstName} ${address.lastName}`
                                : null,
                              address.street,
                              address.postalCode && address.city
                                ? `${address.postalCode} ${address.city}`
                                : address.city,
                              address.phone,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}

                <p className="font-dm-sans text-xs text-secondary-text tracking-widest uppercase group-hover:text-accent transition-colors self-end">
                  Szczegóły →
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}

export default MyOrders;
