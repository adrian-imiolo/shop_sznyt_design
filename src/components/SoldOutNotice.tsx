/**
 * The storefront's one visible statement of the sold-out state (CONTEXT.md):
 * a single line under the hero heading, home page only. Home renders it once
 * the catalog has loaded and `isSoldOut` holds — never before, so it cannot
 * flash on a shop that is about to show stock.
 */
function SoldOutNotice() {
  return (
    <p className="font-cormorant text-xl md:text-2xl italic text-warm-white/80 mb-8 max-w-xl">
      Pracownia wstrzymała produkcję — kolekcja pozostaje do obejrzenia.
    </p>
  );
}

export default SoldOutNotice;
