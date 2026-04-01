import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "@clerk/react";
import type { ShippingMethod, CourierAddress, PaczkomatPoint } from "../types";

const SHIPPING_COSTS: Record<ShippingMethod, number> = {
  paczkomat: 20,
  inpost_kurier: 25,
  dpd: 25,
};

const FREE_SHIPPING_THRESHOLD = 350;

const SHIPPING_OPTIONS: { id: ShippingMethod; label: string }[] = [
  { id: "paczkomat", label: "InPost Paczkomat" },
  { id: "inpost_kurier", label: "InPost Kurier" },
  { id: "dpd", label: "DPD Kurier" },
];

const ADDRESS_FIELDS: { key: keyof CourierAddress; label: string; full?: boolean }[] = [
  { key: "firstName", label: "Imię" },
  { key: "lastName", label: "Nazwisko" },
  { key: "street", label: "Ulica i numer", full: true },
  { key: "postalCode", label: "Kod pocztowy" },
  { key: "city", label: "Miasto" },
  { key: "phone", label: "Telefon" },
];

function Cart() {
  const { items, removeItem, updateQuantity } = useCart();
  const { userId } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod | null>(null);
  const [paczkomatPoint, setPaczkomatPoint] = useState<PaczkomatPoint | null>(null);
  const [address, setAddress] = useState<CourierAddress>({
    firstName: "", lastName: "", street: "", postalCode: "", city: "", phone: "",
  });

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = shippingMethod && !isFreeShipping ? SHIPPING_COSTS[shippingMethod] : 0;
  const total = subtotal + shippingCost;

  useEffect(() => {
    const easyPack = (window as any).easyPack;
    if (easyPack) easyPack.init({ defaultLocale: "pl" });
  }, []);

  function openPaczkomatWidget() {
    const easyPack = (window as any).easyPack;
    if (!easyPack) return;
    easyPack.modalMap(
      (point: any, modal: any) => {
        modal.closeModal();
        setPaczkomatPoint({ code: point.name, name: point.address?.line1 ?? point.name });
      },
      { width: 500, height: 600 },
    );
  }

  function canCheckout() {
    if (!shippingMethod) return false;
    if (shippingMethod === "paczkomat")
      return paczkomatPoint !== null && Object.values(address).every((v) => v.trim() !== "");
    return Object.values(address).every((v) => v.trim() !== "");
  }

  async function handleCheckout() {
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const shippingAddress =
        shippingMethod === "paczkomat"
          ? { ...paczkomatPoint, firstName: address.firstName, lastName: address.lastName, phone: address.phone }
          : address;
      const res = await fetch(`${import.meta.env.VITE_API_URL as string}/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, userId, shippingMethod, shippingAddress }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Błąd serwera");
      }
      const data = await res.json();
      if (!data.url) throw new Error("Nie udało się otworzyć strony płatności");
      window.location.href = data.url;
    } catch (err: any) {
      setCheckoutError(err.message ?? "Nie udało się przejść do płatności. Spróbuj ponownie.");
      setCheckoutLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-warm-white flex flex-col items-center justify-center px-6">
        <p className="font-cormorant text-4xl text-near-black font-light mb-4">
          Twój koszyk jest pusty.
        </p>
        <Link
          to="/sklep"
          className="font-dm-sans text-sm text-near-black border border-near-black px-10 py-3 hover:bg-near-black hover:text-warm-white transition-colors duration-300"
        >
          Przejdź do sklepu
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-warm-white px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-cormorant text-5xl text-near-black font-light mb-12">
          Koszyk
        </h1>

        {/* Item list */}
        <div className="flex flex-col divide-y divide-borders">
          {items.map((item) => (
            <div key={item.id} className="flex gap-6 py-8 items-center">
              <div
                className="w-24 h-24 bg-cover bg-center shrink-0"
                style={{ backgroundImage: `url(${item.imageUrl})` }}
              />
              <div className="flex-1">
                <p className="font-cormorant text-2xl text-near-black font-light mb-1">
                  {item.name}
                </p>
                <p className="font-dm-sans text-sm text-secondary-text">
                  {item.price} PLN / szt.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="w-8 h-8 border border-borders text-near-black font-dm-sans text-lg leading-none hover:bg-near-black hover:text-warm-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed select-none"
                >
                  −
                </button>
                <span className="font-dm-sans text-sm text-near-black w-4 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    updateQuantity(item.id, item.quantity < item.stock ? item.quantity + 1 : item.quantity)
                  }
                  className="w-8 h-8 border border-borders text-near-black font-dm-sans text-lg leading-none hover:bg-near-black hover:text-warm-white transition-colors select-none"
                >
                  +
                </button>
              </div>
              <div className="flex flex-col items-end gap-2 w-32 shrink-0">
                <p className="font-cormorant text-2xl text-near-black font-light">
                  {item.price * item.quantity} PLN
                </p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="font-dm-sans text-xs text-secondary-text hover:text-accent tracking-widest uppercase transition-colors"
                >
                  Usuń
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Shipping */}
        <div className="border-t border-borders pt-8 pb-8">
          <p className="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase mb-6">
            Dostawa
          </p>
          {isFreeShipping ? (
            <div className="flex items-center gap-3 bg-accent/10 border border-accent px-4 py-3 mb-6">
              <span className="text-accent text-base">✓</span>
              <p className="font-dm-sans text-sm text-near-black">
                Masz <span className="font-medium">darmową dostawę</span>!
              </p>
            </div>
          ) : (
            <div className="mb-6">
              <p className="font-dm-sans text-sm text-near-black mb-3">
                Brakuje Ci jeszcze{" "}
                <span className="font-medium text-accent">
                  {FREE_SHIPPING_THRESHOLD - subtotal} PLN
                </span>{" "}
                do darmowej dostawy.
              </p>
              <div className="w-full h-1 bg-borders">
                <div
                  className="h-1 bg-accent transition-all duration-500"
                  style={{ width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Method selector */}
          <div className="flex flex-col gap-3 mb-6">
            {SHIPPING_OPTIONS.map((option) => (
              <label
                key={option.id}
                className={`flex items-center justify-between border px-5 py-4 cursor-pointer transition-colors duration-200 ${
                  shippingMethod === option.id
                    ? "border-near-black bg-near-black text-warm-white"
                    : "border-borders text-near-black hover:border-near-black"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    value={option.id}
                    checked={shippingMethod === option.id}
                    onChange={() => {
                      setShippingMethod(option.id);
                      setPaczkomatPoint(null);
                    }}
                    className="accent-accent"
                  />
                  <span className="font-dm-sans text-sm">{option.label}</span>
                </div>
                <span className="font-dm-sans text-sm">
                  {isFreeShipping ? "Gratis" : `${SHIPPING_COSTS[option.id]} PLN`}
                </span>
              </label>
            ))}
          </div>

          {/* Paczkomat picker */}
          {shippingMethod === "paczkomat" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={openPaczkomatWidget}
                  className="font-dm-sans text-sm border border-near-black px-6 py-3 hover:bg-near-black hover:text-warm-white transition-colors duration-300 self-start"
                >
                  {paczkomatPoint ? "Zmień paczkomat" : "Wybierz paczkomat"}
                </button>
                {paczkomatPoint && (
                  <p className="font-dm-sans text-sm text-near-black">
                    Wybrany: <span className="font-medium">{paczkomatPoint.code}</span>
                    {paczkomatPoint.name !== paczkomatPoint.code && ` — ${paczkomatPoint.name}`}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ADDRESS_FIELDS.map(({ key, label, full }) => (
                  <div key={key} className={full ? "sm:col-span-2" : ""}>
                    <label className="font-dm-sans text-xs text-secondary-text tracking-widest uppercase block mb-1">
                      {label}
                    </label>
                    <input
                      type="text"
                      value={address[key]}
                      onChange={(e) => setAddress((prev) => ({ ...prev, [key]: e.target.value }))}
                      className="w-full border border-borders font-dm-sans text-sm text-near-black px-3 py-2 focus:outline-none focus:border-near-black"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Courier address form */}
          {(shippingMethod === "inpost_kurier" || shippingMethod === "dpd") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ADDRESS_FIELDS.map(({ key, label, full }) => (
                <div key={key} className={full ? "sm:col-span-2" : ""}>
                  <label className="font-dm-sans text-xs text-secondary-text tracking-widest uppercase block mb-1">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={address[key]}
                    onChange={(e) => setAddress((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full border border-borders font-dm-sans text-sm text-near-black px-3 py-2 focus:outline-none focus:border-near-black"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="border-t border-borders pt-8 flex flex-col items-end gap-4">
          <div className="flex gap-16">
            <p className="font-dm-sans text-sm text-secondary-text tracking-widest uppercase">
              Produkty
            </p>
            <p className="font-cormorant text-2xl text-near-black font-light w-32 text-right">
              {subtotal} PLN
            </p>
          </div>
          {shippingMethod && (
            <div className="flex gap-16">
              <p className="font-dm-sans text-sm text-secondary-text tracking-widest uppercase">
                Dostawa
              </p>
              <p className="font-cormorant text-2xl text-near-black font-light w-32 text-right">
                {shippingCost === 0 ? "Gratis" : `${shippingCost} PLN`}
              </p>
            </div>
          )}
          <div className="flex gap-16 border-t border-borders pt-4 mt-2 w-full justify-end">
            <p className="font-dm-sans text-sm text-secondary-text tracking-widest uppercase">
              Suma
            </p>
            <p className="font-cormorant text-3xl text-near-black font-light w-32 text-right">
              {total} PLN
            </p>
          </div>
          {!shippingMethod && (
            <p className="font-dm-sans text-xs text-secondary-text">
              Wybierz metodę dostawy, aby kontynuować.
            </p>
          )}
          {checkoutError && (
            <p className="font-dm-sans text-sm text-red-600">{checkoutError}</p>
          )}
          <button
            onClick={handleCheckout}
            disabled={checkoutLoading || !canCheckout()}
            className="font-dm-sans text-sm text-near-black border border-near-black px-12 py-3 hover:bg-near-black hover:text-warm-white transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checkoutLoading ? "Przekierowywanie..." : "Przejdź do płatności"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default Cart;
