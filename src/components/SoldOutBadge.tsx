/**
 * The shop card's sold-out marker: a small label over the photo, the
 * convention a visitor already reads as "this one is gone". The parent must
 * be positioned; the card's image box is.
 */
function SoldOutBadge() {
  return (
    <span className="absolute top-4 left-4 z-10 bg-warm-white/90 text-near-black font-dm-sans text-[11px] tracking-[0.2em] uppercase px-3 py-1.5">
      Wyprzedane
    </span>
  );
}

export default SoldOutBadge;
