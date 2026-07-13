import { Link } from "react-router-dom";
import { useSearchParams, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Order } from "../types";
import { Show } from "@clerk/react";
import { useCart } from "../hooks/useCart";
import Seo from "../components/Seo";
import { apiFetch } from "../lib/api";
import { clearCheckoutDraft } from "../checkout";
import OrderCard from "../orders/OrderCard";

function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCart();

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;

    async function load() {
      // The webhook that records the order can land after Stripe redirects here —
      // poll briefly before assuming anything is wrong.
      for (let attempt = 1; attempt <= 5; attempt++) {
        try {
          const data = await apiFetch<Order>(`/orders/by-session/${sessionId}`);
          if (cancelled) return;
          setOrder(data);
          clearCart();
          // order placed — the draft's PII must not linger in the session (#74)
          clearCheckoutDraft();
          return;
        } catch {
          // order not recorded yet or network hiccup — fall through to retry
        }
        await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
      }
      if (!cancelled) {
        setError(
          "Płatność została przyjęta, a zamówienie wciąż się przetwarza. Potwierdzenie wyślemy e-mailem — w razie pytań napisz na kontakt@sznytdesign.pl.",
        );
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [sessionId, clearCart]);

  if (!sessionId) return <Navigate to="/sklep" />;
  if (error) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6">
        <Seo
          title="Dziękujemy za zamówienie"
          description="Twoje zamówienie w Sznyt Design zostało przyjęte. Za chwilę otrzymasz potwierdzenie e-mail ze szczegółami dostawy."
        />
        <p className="font-dm-sans text-sm text-near-black max-w-md text-center leading-relaxed">
          {error}
        </p>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6">
        <Seo
          title="Dziękujemy za zamówienie"
          description="Twoje zamówienie w Sznyt Design zostało przyjęte. Za chwilę otrzymasz potwierdzenie e-mail ze szczegółami dostawy."
        />
        <p className="font-dm-sans text-sm text-secondary-text">Przetwarzamy Twoje zamówienie...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 justify-center items-center p-6 min-h-dvh">
      <Seo
        title="Dziękujemy za zamówienie"
        description="Twoje zamówienie w Sznyt Design zostało przyjęte. Za chwilę otrzymasz potwierdzenie e-mail ze szczegółami dostawy."
      />
      <h1 className="font-cormorant font-light text-4xl text-near-black">
        Dziękujemy za zamówienie!
      </h1>

      <OrderCard order={order} variant="summary" />

      <div className="flex flex-col sm:flex-row gap-4">
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
