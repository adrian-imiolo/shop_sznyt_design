import { useCallback, useEffect, useRef } from "react";
import { toPaczkomatPoint } from "./toPaczkomatPoint";
import type { PaczkomatPoint } from "./types";

type PaczkomatPickerProps = {
  selectedPoint: PaczkomatPoint | null;
  onSelect: (point: PaczkomatPoint) => void;
  /** One-shot open request from the checkout draft — auto-opens the map. */
  openRequested: boolean;
  onOpenRequestHandled: () => void;
};

// The widget must be init'd once per page load, not once per mount — the
// picker remounts every time the user toggles away from and back to paczkomat.
let easyPackInitialized = false;

/**
 * Quarantines the easyPack widget (ADR-0003): init, the modal callback and
 * the viewport sizing workaround live here and nowhere else. Emits the
 * selected point; holds no state of its own.
 */
function PaczkomatPicker({
  selectedPoint,
  onSelect,
  openRequested,
  onOpenRequestHandled,
}: PaczkomatPickerProps) {
  useEffect(() => {
    if (easyPackInitialized || !window.easyPack) return;
    window.easyPack.init({ defaultLocale: "pl" });
    easyPackInitialized = true;
  }, []);

  const openWidget = useCallback(() => {
    if (!window.easyPack) return;
    function handlePointSelected(point: EasyPackPoint, modal: EasyPackModal) {
      modal.closeModal();
      onSelect(toPaczkomatPoint(point));
    }
    window.easyPack.modalMap(
      handlePointSelected,
      // the widget hard-codes its size — cap it so the map fits a 375px phone viewport
      {
        width: Math.min(500, window.innerWidth - 32),
        height: Math.min(600, window.innerHeight - 32),
      },
    );
  }, [onSelect]);

  // Ref-guarded because the parent's acknowledgement lands a render later:
  // StrictMode's doubled effect (and any re-render in between) would other-
  // wise see the still-true request and stack a second modal.
  const openRequestHandled = useRef(false);
  useEffect(() => {
    if (!openRequested) {
      openRequestHandled.current = false;
      return;
    }
    if (openRequestHandled.current) return;
    openRequestHandled.current = true;
    onOpenRequestHandled();
    openWidget();
  }, [openRequested, onOpenRequestHandled, openWidget]);

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={openWidget}
        className="font-dm-sans text-sm border border-near-black px-6 py-3 hover:bg-near-black hover:text-warm-white transition-colors duration-300 self-start"
      >
        {selectedPoint ? "Zmień paczkomat" : "Wybierz paczkomat"}
      </button>
      {selectedPoint && (
        <p className="font-dm-sans text-sm text-near-black">
          Wybrany: <span className="font-medium">{selectedPoint.code}</span>
          {selectedPoint.name !== selectedPoint.code && ` — ${selectedPoint.name}`}
        </p>
      )}
    </div>
  );
}

export default PaczkomatPicker;
