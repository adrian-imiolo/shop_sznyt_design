import { Link } from "react-router-dom";
import { useSearchParams, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Order } from "../types";
import { Show } from "@clerk/react";

function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL as string}/orders/by-session/${sessionId}`,
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setOrder(data);
      } catch {
        setError("Nie udało się załadować zamówienia.");
      }
    }
    load();
  }, [sessionId]);

  if (!sessionId) return <Navigate to="/sklep" />;
  if (error) return <p className="font-dm-sans text-sm text-red-600 p-6">{error}</p>;
  if (!order) return <p>Ładowanie...</p>;

  return (
    <div className="flex flex-col gap-8 justify-center items-center p-6 min-h-dvh">
      <h1 className="font-cormorant font-light text-4xl text-near-black">
        Dziękujemy za zamówienie!
      </h1>

      <div className="border border-borders p-8 flex flex-col gap-4 w-full max-w-sm">
        <div className="flex justify-between font-dm-sans text-near-black">
          <span className="text-secondary-text">Numer zamówienia</span>
          <span>#{order.id}</span>
        </div>
        <div className="flex justify-between font-dm-sans text-near-black">
          <span className="text-secondary-text">Status</span>
          <span>{order.status === "paid" ? "Opłacone" : order.status}</span>
        </div>
        <div className="flex justify-between font-dm-sans text-near-black">
          <span className="text-secondary-text">Data</span>
          <span>{new Date(order.createdAt).toLocaleDateString("pl-PL")}</span>
        </div>

        <div className="border-t border-borders pt-4 flex flex-col gap-3">
          {order.items?.map((item) => (
            <div key={item.id} className="flex justify-between font-dm-sans text-near-black text-sm">
              <span>{item.product.name} × {item.quantity}</span>
              <span>{item.price * item.quantity} PLN</span>
            </div>
          ))}
        </div>

        <div className="border-t border-borders pt-4 flex justify-between font-dm-sans text-near-black font-medium">
          <span>Suma</span>
          <span>{order.total} PLN</span>
        </div>
      </div>

      <div className="flex gap-4">
        <Show when="signed-in">
          <Link
            className="border border-near-black text-near-black font-dm-sans px-6 py-3 hover:bg-near-black hover:text-warm-white transition-colors duration-300"
            to="/moje-zamowienia"
          >
            Moje zamówienia
          </Link>
        </Show>
        <Link
          className="bg-near-black text-warm-white font-dm-sans px-6 py-3 hover:bg-accent transition-colors duration-300"
          to="/sklep"
        >
          Wróć do sklepu
        </Link>
      </div>
    </div>
  );
}

export default OrderSuccess;
