import { useEffect } from "react";
import type { PaczkomatPoint } from "./types";

type PaczkomatPickerProps = {
  selectedPoint: PaczkomatPoint | null;
  onSelect: (point: PaczkomatPoint) => void;
};

/**
 * Quarantines the easyPack widget (ADR-0003): init, the modal callback and
 * the viewport sizing workaround live here and nowhere else. Emits the
 * selected point; holds no state of its own.
 */
function PaczkomatPicker({ selectedPoint, onSelect }: PaczkomatPickerProps) {
  useEffect(() => {
    window.easyPack?.init({ defaultLocale: "pl" });
  }, []);

  function openWidget() {
    if (!window.easyPack) return;
    window.easyPack.modalMap(
      (point, modal) => {
        modal.closeModal();
        onSelect({
          code: point.name,
          name: point.address?.line1 ?? point.name,
          city: point.address?.city,
        });
      },
      // the widget hard-codes its size — cap it so the map fits a 375px phone viewport
      {
        width: Math.min(500, window.innerWidth - 32),
        height: Math.min(600, window.innerHeight - 32),
      },
    );
  }

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
