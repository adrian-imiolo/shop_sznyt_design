import { useMemo, useReducer } from "react";
import { FULFILLMENT_STATUSES, FULFILLMENT_LABELS_SHORT } from "@sznyt/shared";
import type { FulfillmentStatus } from "@sznyt/shared";
import { useAuth } from "@clerk/react";
import { apiFetch } from "../lib/api";
import {
  createFulfillmentSaver,
  fulfillmentSaveReducer,
  initFulfillmentSave,
  type FulfillmentDraft,
} from "./fulfillmentSave";

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
  const [state, dispatch] = useReducer(
    fulfillmentSaveReducer,
    {
      status: fulfillmentStatus as FulfillmentStatus,
      tracking: trackingNumber ?? "",
    },
    initFulfillmentSave,
  );

  const save = useMemo(
    () =>
      createFulfillmentSaver(function patchFulfillment(draft: FulfillmentDraft) {
        return apiFetch(`/orders/${orderId}/fulfillment`, {
          method: "PATCH",
          auth: getToken,
          body: { fulfillmentStatus: draft.status, trackingNumber: draft.tracking },
        });
      }, dispatch),
    [orderId, getToken],
  );

  return (
    <div className="flex flex-col gap-1 min-w-45">
      <select
        value={state.draft.status}
        disabled={state.saving}
        onChange={(e) => {
          // options are rendered from FULFILLMENT_STATUSES, so the cast is safe
          const draft = { ...state.draft, status: e.target.value as FulfillmentStatus };
          dispatch({ type: "edit", draft });
          save(draft);
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
        value={state.draft.tracking}
        onChange={(e) =>
          dispatch({ type: "edit", draft: { ...state.draft, tracking: e.target.value } })
        }
        onBlur={() => save(state.draft)}
        className="border border-borders text-xs px-2 py-1 focus:outline-none focus:border-near-black placeholder:text-gray-400"
      />
      {state.error && (
        <p role="alert" className="text-xs text-red-600">{state.error}</p>
      )}
    </div>
  );
}

export default FulfillmentControls;
