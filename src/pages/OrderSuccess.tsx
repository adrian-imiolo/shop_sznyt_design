import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Order } from "../types";

function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const sessionId = searchParams.get("session_id");
  console.log(sessionId);

  useEffect(() => {
    async function load() {
      if (!sessionId) return;
      const res = await fetch(
        `http://localhost:3000/orders/by-session/${sessionId}`,
      );
      const data = await res.json();
      setOrder(data);
    }
    load();
  }, [sessionId]);

  if (!order) return;

  return (
    <div className="flex flex-col gap-6 justify-center items-center p-6 min-h-dvh">
      <h1 className="text-2xl font-dm-sans text-near-black">
        Dziękujemy za złożenie zamówienia!
      </h1>
      <p className="text-xl font-dm-sans text-near-black">
        Twój numer zamówienia: {order.id}
      </p>
      <p className="text-xl font-dm-sans text-near-black">
        Status zamówienia: {order.status}
      </p>
      <p className="text-xl font-dm-sans text-near-black">
        Suma zamówienia: {order.total}
      </p>
      <p className="text-xl font-dm-sans text-near-black">
        Stworzono: {order.createdAt}
      </p>
      <Link
        className="border border-borders text-warm-white text-xl p-6 bg-near-black hover:bg-warm-white hover:text-near-black transition-colors duration-300"
        to="/sklep"
      >
        Wróć do sklepu
      </Link>
    </div>
  );
}

export default OrderSuccess;
