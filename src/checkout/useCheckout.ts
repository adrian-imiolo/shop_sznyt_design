import { useState } from "react";
import { useAuth } from "@clerk/react";
import type { ShippingMethod } from "@sznyt/shared";
import { apiFetch } from "../lib/api";
import { buildCheckoutRequest } from "./buildCheckoutRequest";
import { checkoutTotals } from "./checkoutTotals";
import { validateCheckoutDraft } from "./validateCheckoutDraft";
import { EMPTY_ADDRESS } from "./types";
import type { AddressErrors, AddressField, CheckoutDraft, CourierAddress, PaczkomatPoint } from "./types";

/**
 * Thin glue over the pure checkout core: holds the draft state, derives
 * validity and totals from it, and submits through apiFetch. UI-only gates
 * (regulamin acceptance, demo mode) deliberately stay in the component.
 */
export function useCheckout(items: { id: number; price: number; quantity: number }[]) {
  const { userId } = useAuth();
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod | null>(null);
  const [paczkomatPoint, setPaczkomatPoint] = useState<PaczkomatPoint | null>(null);
  const [address, setAddress] = useState<CourierAddress>(EMPTY_ADDRESS);
  const [addressErrors, setAddressErrors] = useState<AddressErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const draft: CheckoutDraft = { shippingMethod, paczkomatPoint, address };
  const validity = validateCheckoutDraft(draft);
  const totals = checkoutTotals(items, shippingMethod);
  const isComplete = validity.missing.length === 0;

  function selectShippingMethod(method: ShippingMethod) {
    setShippingMethod(method);
    setPaczkomatPoint(null);
  }

  function updateAddressField(field: AddressField, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }));
    if (addressErrors[field]) setAddressErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function submit() {
    if (Object.keys(validity.fieldErrors).length > 0) {
      setAddressErrors(validity.fieldErrors);
      return;
    }
    setAddressErrors({});
    setSubmitting(true);
    setSubmitError(null);
    try {
      const data = await apiFetch<{ url?: string }>("/create-checkout-session", {
        method: "POST",
        body: buildCheckoutRequest(items, userId, draft),
      });
      if (!data.url) throw new Error("Nie udało się otworzyć strony płatności");
      window.location.href = data.url;
    } catch (err) {
      setSubmitError(
        err instanceof Error && err.message
          ? err.message
          : "Nie udało się przejść do płatności. Spróbuj ponownie.",
      );
      setSubmitting(false);
    }
  }

  return {
    shippingMethod,
    selectShippingMethod,
    paczkomatPoint,
    selectPaczkomatPoint: setPaczkomatPoint,
    address,
    updateAddressField,
    addressErrors,
    isComplete,
    totals,
    submitting,
    submitError,
    submit,
  };
}
