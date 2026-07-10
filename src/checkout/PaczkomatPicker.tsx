import { useEffect } from "react";
import type { PaczkomatPoint } from "./types";

type PaczkomatPickerProps = {
  point: PaczkomatPoint | null;
  onSelect: (point: PaczkomatPoint) => void;
};

// The widget is configured once per page load — re-initializing on every
// picker re-mount (method toggles) is not something easyPack documents as safe.
let easyPackInitialized = false;

function ensureEasyPackInit() {
  if (easyPackInitialized || !window.easyPack) return;
  window.easyPack.init({ defaultLocale: "pl" });
  easyPackInitialized = true;
}

/**
 * Quarantines the easyPack widget: this is the only checkout file that
 * touches the widget. Swapping the InPost widget means swapping this file.
 */
function PaczkomatPicker({ point, onSelect }: PaczkomatPickerProps) {
  useEffect(ensureEasyPackInit, []);

  function openWidget() {
    if (!window.easyPack) return;
    ensureEasyPackInit();
    window.easyPack.modalMap(
      function handlePointSelected(widgetPoint, modal) {
        modal.closeModal();
        onSelect({
          code: widgetPoint.name,
          name: widgetPoint.address?.line1 ?? widgetPoint.name,
          city: widgetPoint.address?.city,
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
        {point ? "Zmień paczkomat" : "Wybierz paczkomat"}
      </button>
      {point && (
        <p className="font-dm-sans text-sm text-near-black">
          Wybrany: <span className="font-medium">{point.code}</span>
          {point.name !== point.code && ` — ${point.name}`}
        </p>
      )}
    </div>
  );
}

export default PaczkomatPicker;
