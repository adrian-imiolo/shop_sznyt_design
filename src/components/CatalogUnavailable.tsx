import Eyebrow from "./Eyebrow";

type CatalogUnavailableProps = {
  /** What could not load. Defaults to the collection. */
  title?: string;
  /** Tighter vertical rhythm for use inside another section (the shop grid). */
  compact?: boolean;
  onRetry: () => void;
};

/**
 * Shown when a catalog request fails. It frames the failure as a pause, not
 * a broken shop: a cold backend answers late and a dead one never, and either
 * way the visitor gets a calm line and a retry instead of red error text.
 */
function CatalogUnavailable({
  title = "Kolekcja chwilowo niedostępna.",
  compact = false,
  onRetry,
}: CatalogUnavailableProps) {
  return (
    <section className={`bg-warm-white px-6 text-center ${compact ? "py-10" : "py-20 md:py-28"}`}>
      <div className="max-w-xl mx-auto">
        <Eyebrow spacing="mb-6">Sklep</Eyebrow>
        <h2 className="font-cormorant text-3xl md:text-4xl text-near-black font-light mb-4">
          {title}
        </h2>
        <p className="font-dm-sans text-sm text-secondary-text mb-8">
          Sklep właśnie się budzi. Spróbuj ponownie za chwilę.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-block font-dm-sans text-sm text-near-black border border-near-black px-8 py-3 hover:bg-near-black hover:text-warm-white transition-colors duration-300"
        >
          Spróbuj ponownie
        </button>
      </div>
    </section>
  );
}

export default CatalogUnavailable;
