import { useCallback } from "react";
import { FULFILLMENT_STATUSES, FULFILLMENT_LABELS_SHORT } from "@sznyt/shared";
import type { FulfillmentStatus } from "@sznyt/shared";
import { useAuth } from "@clerk/react";
import { apiFetch } from "../lib/api";
import { useFulfillmentSave, type FulfillmentDraft } from "./fulfillmentSave";

/**
 * The status select + tracking input pair used on every admin surface that
 * fulfills orders (the orders list cell and the order detail page). Saves
 * through PATCH /orders/:id/fulfillment, which also fires the shipping
 * confirmation email — the two surfaces share behavior by sharing this
 * component. Uncontrolled from the parent's perspective: owns its own draft
 * state seeded from the order's persisted values.
 */
function FulfillmentControls({
  orderId,
  fulfillmentStatus,
  trackingNumber,
}: {
  orderId: number;
  fulfillmentStatus: string;
  trackingNumber: string | null;
}) {
  const { getToken } = useAuth();

  const patchFulfillment = useCallback(
    (draft: FulfillmentDraft) =>
      apiFetch(`/orders/${orderId}/fulfillment`, {
        method: "PATCH",
        auth: getToken,
        body: { fulfillmentStatus: draft.status, trackingNumber: draft.tracking },
      }),
    [orderId, getToken],
  );

  const { draft, saving, error, edit, save } = useFulfillmentSave(
    { status: fulfillmentStatus as FulfillmentStatus, tracking: trackingNumber ?? "" },
    patchFulfillment,
  );

  return (
    <div className="flex flex-col gap-1 min-w-45">
      <select
        value={draft.status}
        disabled={saving}
        onChange={(e) => {
          // options are rendered from FULFILLMENT_STATUSES, so the cast is safe
          const next = { ...draft, status: e.target.value as FulfillmentStatus };
          edit(next);
          save(next);
        }}
        className="border border-borders text-sm px-2 py-1 bg-white focus:outline-none focus:border-near-black"
      >
        {FULFILLMENT_STATUSES.map((s) => (
          <option key={s} value={s}>{FULFILLMENT_LABELS_SHORT[s]}</option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Nr przesyłki"
        value={draft.tracking}
        onChange={(e) => edit({ ...draft, tracking: e.target.value })}
        onBlur={() => save(draft)}
        className="border border-borders text-xs px-2 py-1 focus:outline-none focus:border-near-black placeholder:text-gray-400"
      />
      {error && (
        <p role="alert" className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

export default FulfillmentControls;
