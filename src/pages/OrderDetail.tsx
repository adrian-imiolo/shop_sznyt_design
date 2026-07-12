import { useParams, Link, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/react";
import type { Order } from "../types";
import Seo from "../components/Seo";
import { useResource } from "../hooks/useResource";
import OrderCard from "../orders/OrderCard";

const ORDER_DETAIL_DESCRIPTION =
  "Podgląd zamówienia w Sznyt Design — pozycje, adres dostawy, sposób płatności i status realizacji.";

function OrderDetail() {
  const { id } = useParams();
  const { userId, isLoaded } = useAuth();
  const { data: order, error: loadFailed } = useResource<Order>(
    userId ? `/orders/${id}` : null,
    { auth: true },
  );
  const error = loadFailed ? "Nie udało się załadować zamówienia." : null;

  if (!isLoaded) return null;
  if (!userId) return <Navigate to="/moje-zamowienia" />;

  if (error)
    return (
      <main className="min-h-screen bg-warm-white px-6 py-16 flex justify-center items-center">
        <Seo title="Szczegóły zamówienia" description={ORDER_DETAIL_DESCRIPTION} />
        <p className="font-dm-sans text-sm text-red-600">{error}</p>
      </main>
    );

  if (!order)
    return (
      <main className="min-h-screen bg-warm-white px-6 py-16 flex justify-center items-center">
        <Seo title="Szczegóły zamówienia" description={ORDER_DETAIL_DESCRIPTION} />
        <p className="font-dm-sans text-sm text-secondary-text">Ładowanie...</p>
      </main>
    );

  return (
    <main className="min-h-screen bg-warm-white px-6 py-16">
      <Seo title={`Zamówienie #${order.id}`} description={ORDER_DETAIL_DESCRIPTION} />
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <Link
          to="/moje-zamowienia"
          className="font-dm-sans text-xs text-secondary-text tracking-widest uppercase hover:text-accent transition-colors mb-10 inline-block"
        >
          ← Moje zamówienia
        </Link>

        <OrderCard order={order} variant="detail" />
      </div>
    </main>
  );
}

export default OrderDetail;
