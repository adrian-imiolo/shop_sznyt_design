import { RedirectToSignIn, useAuth } from "@clerk/react";
import { useResource } from "../hooks/useResource";
import type { Order } from "../types";
import Skeleton from "../components/Skeleton";
import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import OrderCard from "../orders/OrderCard";

const MY_ORDERS_DESCRIPTION =
  "Historia i status Twoich zamówień w Sznyt Design — sprawdź szczegóły dostawy i numer śledzenia przesyłki.";

function MyOrders() {
  const { userId, isLoaded } = useAuth();
  const { data: orders, error: loadFailed } = useResource<Order[]>(
    userId ? `/orders/user/${userId}` : null,
    { auth: true },
  );
  const error = loadFailed ? "Nie udało się załadować zamówień. Spróbuj ponownie." : null;

  if (!isLoaded) return null;
  if (!userId) return <RedirectToSignIn />;

  if (error)
    return (
      <main className="min-h-screen bg-warm-white px-6 py-16 flex justify-center items-center">
        <Seo title="Moje zamówienia" description={MY_ORDERS_DESCRIPTION} />
        <p className="font-dm-sans text-sm text-red-600">{error}</p>
      </main>
    );

  if (!orders)
    return (
      <main className="min-h-screen bg-warm-white px-6 py-16">
        <Seo title="Moje zamówienia" description={MY_ORDERS_DESCRIPTION} />
        <div className="max-w-3xl mx-auto">
          <h1 className="font-cormorant text-3xl md:text-5xl text-near-black font-light mb-8 md:mb-12">
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
      <main className="min-h-screen bg-warm-white flex flex-col items-center justify-center px-6 gap-8">
        <Seo title="Moje zamówienia" description={MY_ORDERS_DESCRIPTION} />
        <h2 className="font-cormorant text-4xl text-near-black font-light">
          Nie złożono jeszcze żadnych zamówień.
        </h2>
        <Link
          to="/sklep"
          className="font-dm-sans text-sm text-near-black border border-near-black px-8 py-3 hover:bg-near-black hover:text-warm-white transition-colors duration-300"
        >
          Zobacz kolekcję
        </Link>
      </main>
    );

  return (
    <main className="min-h-screen bg-warm-white px-6 py-16">
      <Seo title="Moje zamówienia" description={MY_ORDERS_DESCRIPTION} />
      <div className="max-w-3xl mx-auto">
        <h1 className="font-cormorant text-5xl text-near-black font-light mb-12">
          Moje zamówienia
        </h1>

        <div className="flex flex-col divide-y divide-borders">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/moje-zamowienia/${order.id}`}
              className="py-8 flex flex-col gap-4 group"
            >
              <OrderCard order={order} variant="list" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

export default MyOrders;
