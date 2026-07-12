import { useState } from "react";
import type { ShippingMethod } from "@sznyt/shared";
import { apiFetch } from "../lib/api";
import { validateCheckoutDraft } from "./validateCheckoutDraft";
import { buildCheckoutRequest } from "./buildCheckoutRequest";
import type { CheckoutDraft, CheckoutFieldErrors, CourierAddress, PaczkomatPoint } from "./types";
import type { CartItem } from "../types";

const EMPTY_ADDRESS: CourierAddress = {
  firstName: "", lastName: "", street: "", postalCode: "", city: "", phone: "", email: "",
};

/**
 * Thin glue between the pure checkout core and the Cart page: draft state,
 * submit via apiFetch, loading/error. Completeness gates the button live;
 * format errors surface only on a submit attempt and clear per field on
 * edit — the two-stage UX from before the extraction (ADR-0003). The
 * Stripe redirect is this hook's only browser dependency.
 */
export function useCheckout(items: CartItem[], userId: string | null | undefined) {
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod | null>(null);
  const [paczkomatPoint, setPaczkomatPoint] = useState<PaczkomatPoint | null>(null);
  const [address, setAddress] = useState<CourierAddress>(EMPTY_ADDRESS);
  const [note, setNote] = useState("");
  const [fieldErrors, setFieldErrors] = useState<CheckoutFieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const draft: CheckoutDraft = { items, shippingMethod, paczkomatPoint, address };
  const isComplete = validateCheckoutDraft(draft).missing.length === 0;

  function selectShippingMethod(method: ShippingMethod) {
    setShippingMethod(method);
    setPaczkomatPoint(null);
  }

  function setAddressField(key: keyof CourierAddress, value: string) {
    setAddress((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function submit() {
    const { fieldErrors: errors } = validateCheckoutDraft(draft);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ url?: string }>("/create-checkout-session", {
        method: "POST",
        body: buildCheckoutRequest(draft, userId ?? null, note),
      });
      if (!data.url) throw new Error("Nie udało się otworzyć strony płatności");
      window.location.href = data.url;
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Nie udało się przejść do płatności. Spróbuj ponownie.",
      );
      setLoading(false);
    }
  }

  return {
    shippingMethod,
    selectShippingMethod,
    paczkomatPoint,
    setPaczkomatPoint,
    address,
    setAddressField,
    note,
    setNote,
    fieldErrors,
    isComplete,
    loading,
    error,
    submit,
  };
}
