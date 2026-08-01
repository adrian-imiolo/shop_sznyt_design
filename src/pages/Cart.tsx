import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useAuth } from "@clerk/react";
import type { ShippingMethod } from "../types";
import {
  SHIPPING_METHODS,
  SHIPPING_METHOD_LABELS,
  SHIPPING_COSTS,
  FREE_SHIPPING_THRESHOLD,
  ORDER_NOTE_MAX_LENGTH,
  formatPln,
} from "@sznyt/shared";
import { useCheckout, checkoutTotals, PaczkomatPicker } from "../checkout";
import type { CheckoutFieldErrors, CourierAddress } from "../checkout";
import Seo from "../components/Seo";

const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

const SHIPPING_OPTIONS: { id: ShippingMethod; label: string }[] = SHIPPING_METHODS.map(
  (id) => ({ id, label: SHIPPING_METHOD_LABELS[id] }),
);

const ADDRESS_FIELDS: { key: keyof CourierAddress; label: string; full?: boolean; type?: string }[] = [
  { key: "firstName", label: "Imię" },
  { key: "lastName", label: "Nazwisko" },
  { key: "email", label: "Adres e-mail", full: true, type: "email" },
  { key: "street", label: "Ulica i numer", full: true },
  { key: "postalCode", label: "Kod pocztowy" },
  { key: "city", label: "Miasto" },
  { key: "phone", label: "Telefon" },
];

type AddressFormProps = {
  address: CourierAddress;
  fieldErrors: CheckoutFieldErrors;
  onFieldChange: (key: keyof CourierAddress, value: string) => void;
};

function AddressForm({ address, fieldErrors, onFieldChange }: AddressFormProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {ADDRESS_FIELDS.map(({ key, label, full, type }) => (
        <div key={key} className={full ? "sm:col-span-2" : ""}>
          <label
            htmlFor={`address-${key}`}
            className="font-dm-sans text-xs text-secondary-text tracking-widest uppercase block mb-1"
          >
            {label}
          </label>
          <input
            id={`address-${key}`}
            type={type ?? "text"}
            value={address[key]}
            onChange={(e) => onFieldChange(key, e.target.value)}
            className={`w-full border font-dm-sans text-base sm:text-sm text-near-black px-3 py-2 focus:outline-none focus:border-near-black ${fieldErrors[key] ? "border-red-400" : "border-borders"}`}
          />
          {fieldErrors[key] && (
            <p className="font-dm-sans text-xs text-red-500 mt-1">{fieldErrors[key]}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function Cart() {
  const { items, removeItem, updateQuantity } = useCart();
  const { userId } = useAuth();
  const [regulaminAccepted, setRegulaminAccepted] = useState(false);
  const {
    shippingMethod,
    selectShippingMethod,
    paczkomatPoint,
    setPaczkomatPoint,
    paczkomatOpenRequested,
    clearPaczkomatOpenRequest,
    address,
    setAddressField,
    note,
    setNote,
    fieldErrors,
    isComplete,
    loading: checkoutLoading,
    error: checkoutError,
    submit,
  } = useCheckout(items, userId);

  const { subtotal, shippingCost, total, isFreeShipping } = checkoutTotals(items, shippingMethod);

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-warm-white flex flex-col items-center justify-center px-6">
        <Seo
          title="Koszyk"
          description="Twój koszyk w sklepie Sznyt Design — sprawdź wybrane ramki i przejdź do bezpiecznej płatności."
        />
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
      <Seo
        title="Koszyk"
        description="Twój koszyk w sklepie Sznyt Design — sprawdź wybrane ramki i przejdź do bezpiecznej płatności."
      />
      <div className="max-w-4xl mx-auto">
        <h1 className="font-cormorant text-3xl md:text-5xl text-near-black font-light mb-8 md:mb-12">
          Koszyk
        </h1>

        {/* Item list */}
        <div className="flex flex-col divide-y divide-borders">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 py-6 md:py-8">
              <div
                className="w-16 md:w-24 aspect-[4/5] bg-cover bg-center shrink-0 mt-1"
                style={{ backgroundImage: `url(${item.imageUrl})` }}
              />
              <div className="flex-1 min-w-0 flex flex-col gap-3">
                {/* Name + unit price */}
                <div>
                  <p className="font-cormorant text-xl md:text-2xl text-near-black font-light leading-snug">
                    {item.name}
                  </p>
                  <p className="font-dm-sans text-sm text-secondary-text">
                    {formatPln(item.price)} / szt.
                  </p>
                </div>
                {/* Controls row */}
                <div className="flex items-center justify-between">
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
                  <div className="flex flex-col items-end gap-1">
                    <p className="font-cormorant text-xl md:text-2xl text-near-black font-light">
                      {formatPln(item.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="font-dm-sans text-xs text-secondary-text hover:text-accent tracking-widest uppercase transition-colors"
                    >
                      Usuń
                    </button>
                  </div>
                </div>
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
                  {formatPln(FREE_SHIPPING_THRESHOLD - subtotal)}
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
                    onChange={() => selectShippingMethod(option.id)}
                    className="accent-accent"
                  />
                  <span className="font-dm-sans text-sm">{option.label}</span>
                </div>
                <span className="font-dm-sans text-sm">
                  {isFreeShipping ? "Gratis" : formatPln(SHIPPING_COSTS[option.id])}
                </span>
              </label>
            ))}
          </div>

          {/* Paczkomat picker */}
          {shippingMethod === "paczkomat" && (
            <div className="flex flex-col gap-4">
              <PaczkomatPicker
                selectedPoint={paczkomatPoint}
                onSelect={setPaczkomatPoint}
                openRequested={paczkomatOpenRequested}
                onOpenRequestHandled={clearPaczkomatOpenRequest}
              />
              <AddressForm address={address} fieldErrors={fieldErrors} onFieldChange={setAddressField} />
            </div>
          )}

          {/* Courier address form */}
          {(shippingMethod === "inpost_kurier" || shippingMethod === "dpd") && (
            <AddressForm address={address} fieldErrors={fieldErrors} onFieldChange={setAddressField} />
          )}

          {/* Order note */}
          {shippingMethod && (
            <div className="mt-6">
              <label
                htmlFor="order-note"
                className="font-dm-sans text-xs text-secondary-text tracking-widest uppercase block mb-1"
              >
                Uwagi do zamówienia (opcjonalnie)
              </label>
              <textarea
                id="order-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={ORDER_NOTE_MAX_LENGTH}
                rows={3}
                placeholder="Np. kod do bramy, preferowane godziny doręczenia"
                className="w-full border border-borders font-dm-sans text-base sm:text-sm text-near-black px-3 py-2 resize-y focus:outline-none focus:border-near-black placeholder:text-gray-400"
              />
              <p className="font-dm-sans text-xs text-secondary-text text-right mt-1">
                {note.length}/{ORDER_NOTE_MAX_LENGTH}
              </p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="border-t border-borders pt-8 flex flex-col items-end gap-4">
          <div className="flex gap-8 md:gap-16">
            <p className="font-dm-sans text-sm text-secondary-text tracking-widest uppercase">
              Produkty
            </p>
            <p className="font-cormorant text-2xl text-near-black font-light w-32 text-right">
              {formatPln(subtotal)}
            </p>
          </div>
          {shippingMethod && (
            <div className="flex gap-8 md:gap-16">
              <p className="font-dm-sans text-sm text-secondary-text tracking-widest uppercase">
                Dostawa
              </p>
              <p className="font-cormorant text-2xl text-near-black font-light w-32 text-right">
                {shippingCost === 0 ? "Gratis" : formatPln(shippingCost)}
              </p>
            </div>
          )}
          <div className="flex gap-8 md:gap-16 border-t border-borders pt-4 mt-2 w-full justify-end">
            <p className="font-dm-sans text-sm text-secondary-text tracking-widest uppercase">
              Suma
            </p>
            <p className="font-cormorant text-3xl text-near-black font-light w-32 text-right">
              {formatPln(total)}
            </p>
          </div>
          {!shippingMethod && (
            <p className="font-dm-sans text-xs text-secondary-text">
              Wybierz metodę dostawy, aby kontynuować.
            </p>
          )}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={regulaminAccepted}
              onChange={(e) => setRegulaminAccepted(e.target.checked)}
              className="mt-0.5 shrink-0 accent-near-black w-4 h-4"
            />
            <span className="font-dm-sans text-xs text-secondary-text leading-relaxed">
              Akceptuję{" "}
              <Link to="/regulamin" className="text-near-black hover:text-accent underline" target="_blank">
                Regulamin sklepu
              </Link>{" "}
              oraz{" "}
              <Link to="/polityka-prywatnosci" className="text-near-black hover:text-accent underline" target="_blank">
                Politykę prywatności
              </Link>
            </span>
          </label>
          {checkoutError && (
            <p className="font-dm-sans text-sm text-red-600">{checkoutError}</p>
          )}
          {IS_DEMO_MODE && (
            <p className="font-dm-sans text-xs text-secondary-text text-right max-w-sm">
              Portfolio demo — checkout runs in Stripe <strong>test mode</strong>.
              Pay with card <strong>4242 4242 4242 4242</strong>, any future
              expiry date and any CVC. No real money moves.
            </p>
          )}
          <button
            onClick={submit}
            disabled={checkoutLoading || !isComplete || !regulaminAccepted}
            className="self-center sm:self-end mt-2 font-dm-sans text-sm text-near-black border border-near-black px-12 py-3 hover:bg-near-black hover:text-warm-white transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checkoutLoading ? "Przekierowywanie..." : "Przejdź do płatności"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default Cart;
