import { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/react";
import type { Order } from "../types";

const SHIPPING_LABELS: Record<string, string> = {
  paczkomat: "InPost Paczkomat",
  inpost_kurier: "InPost Kurier",
  dpd: "DPD Kurier",
};

const PAYMENT_LABELS: Record<string, string> = {
  card: "Karta płatnicza",
  p24: "Przelewy24",
  blik: "BLIK",
};

const STATUS_CONFIG: Record<string, { label: string; dot: string }> = {
  paid:      { label: "Opłacone",               dot: "bg-green-500" },
  pending:   { label: "Oczekuje na płatność",   dot: "bg-amber-400" },
  cancelled: { label: "Anulowane",              dot: "bg-red-500" },
  failed:    { label: "Nieudane",               dot: "bg-red-500" },
};

const FULFILLMENT_CONFIG: Record<string, { label: string; dot: string }> = {
  received:   { label: "Zamówienie przyjęte",   dot: "bg-amber-400" },
  processing: { label: "W realizacji",          dot: "bg-blue-400" },
  shipped:    { label: "Wysłane",               dot: "bg-green-500" },
  delivered:  { label: "Dostarczone",           dot: "bg-green-700" },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, dot: "bg-gray-400" };
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}

function FulfillmentBadge({ status }: { status: string }) {
  const config = FULFILLMENT_CONFIG[status] ?? { label: status, dot: "bg-gray-400" };
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
      <span className="font-dm-sans text-sm text-near-black">{config.label}</span>
    </span>
  );
}

function OrderDetail() {
  const { id } = useParams();
  const { userId, isLoaded, getToken } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    async function load() {
      try {
        const token = await getToken();
        const res = await fetch(`${import.meta.env.VITE_API_URL as string}/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setOrder(data);
      } catch {
        setError("Nie udało się załadować zamówienia.");
      }
    }
    load();
  }, [userId, id]);

  if (!isLoaded) return null;
  if (!userId) return <Navigate to="/moje-zamowienia" />;

  if (error)
    return (
      <main className="min-h-screen bg-warm-white px-6 py-16 flex justify-center items-center">
        <p className="font-dm-sans text-sm text-red-600">{error}</p>
      </main>
    );

  if (!order)
    return (
      <main className="min-h-screen bg-warm-white px-6 py-16 flex justify-center items-center">
        <p className="font-dm-sans text-sm text-secondary-text">Ładowanie...</p>
      </main>
    );

  const address = order.shippingAddress;

  return (
    <main className="min-h-screen bg-warm-white px-6 py-16">
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <Link
          to="/moje-zamowienia"
          className="font-dm-sans text-xs text-secondary-text tracking-widest uppercase hover:text-accent transition-colors mb-10 inline-block"
        >
          ← Moje zamówienia
        </Link>

        <h1 className="font-cormorant text-3xl md:text-5xl text-near-black font-light mb-2">
          Zamówienie #{order.id}
        </h1>
        <p className="font-dm-sans text-sm text-secondary-text mb-4">
          {new Date(order.createdAt).toLocaleDateString("pl-PL")} · <StatusBadge status={order.status} />
        </p>
        <div className="flex flex-col gap-1 mb-12">
          <FulfillmentBadge status={order.fulfillmentStatus} />
          {order.trackingNumber && (
            <p className="font-dm-sans text-xs text-secondary-text">
              Nr przesyłki: <span className="text-near-black font-medium">{order.trackingNumber}</span>
            </p>
          )}
        </div>

        {/* Products */}
        <div className="flex flex-col divide-y divide-borders mb-12">
          {order.items?.map((item) => (
            <div key={item.id} className="flex gap-4 md:gap-6 py-6 items-center">
              {item.product?.imageUrl ? (
                <div
                  className="w-14 h-14 md:w-20 md:h-20 bg-cover bg-center shrink-0"
                  style={{ backgroundImage: `url(${item.product.imageUrl})` }}
                />
              ) : (
                <div className="w-14 h-14 md:w-20 md:h-20 bg-borders shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-cormorant text-lg md:text-xl text-near-black font-light">
                  {item.product?.name ?? "Produkt usunięty"}
                </p>
                <p className="font-dm-sans text-sm text-secondary-text">
                  {item.quantity} szt. × {item.price} PLN
                </p>
              </div>
              <p className="font-cormorant text-lg md:text-xl text-near-black font-light w-20 md:w-28 text-right">
                {item.price * item.quantity} PLN
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10">
          {/* Payment method */}
          {order.paymentMethod && (
            <div className="sm:col-span-2">
              <p className="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase mb-4">
                Płatność
              </p>
              <p className="font-dm-sans text-sm text-near-black font-medium">
                {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
              </p>
            </div>
          )}

          {/* Shipping info */}
          <div>
            <p className="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase mb-4">
              Dostawa
            </p>
            {order.shippingMethod ? (
              <div className="font-dm-sans text-sm text-near-black flex flex-col gap-1">
                <p className="font-medium">{SHIPPING_LABELS[order.shippingMethod] ?? order.shippingMethod}</p>
                {order.shippingMethod === "paczkomat" && address?.code && (
                  <p>Paczkomat: {address.code}{address.city ? `, ${address.city}` : ""}</p>
                )}
                {order.shippingMethod !== "paczkomat" && address && (
                  <>
                    {address.street && <p>{address.street}</p>}
                    {address.postalCode && <p>{address.postalCode} {address.city}</p>}
                  </>
                )}
              </div>
            ) : (
              <p className="font-dm-sans text-sm text-secondary-text">Brak danych</p>
            )}
          </div>

          {/* Address */}
          <div>
            <p className="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase mb-4">
              Dane odbiorcy
            </p>
            {address ? (
              <div className="font-dm-sans text-sm text-near-black flex flex-col gap-1">
                {address.firstName && <p>{address.firstName} {address.lastName}</p>}
                {address.street && <p>{address.street}</p>}
                {address.postalCode && <p>{address.postalCode} {address.city}</p>}
                {address.phone && <p>{address.phone}</p>}
              </div>
            ) : (
              <p className="font-dm-sans text-sm text-secondary-text">Brak danych</p>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="border-t border-borders mt-10 pt-6 flex justify-between items-center">
          <p className="font-dm-sans text-sm text-secondary-text tracking-widest uppercase">Suma</p>
          <p className="font-cormorant text-3xl text-near-black font-light">{order.total} PLN</p>
        </div>
      </div>
    </main>
  );
}

export default OrderDetail;
