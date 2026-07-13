import { Link } from "react-router-dom";
import { useCookieConsent } from "../hooks/useCookieConsent";

function CookieBanner() {
  const { consent, accept, decline } = useCookieConsent();

  if (consent !== null) return null;

  return (
    // sm:pr-24 keeps the buttons clear of the fixed scroll-to-top button (bottom-6 right-6)
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-near-black text-warm-white px-6 py-5 sm:pr-24 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
      <p className="font-dm-sans text-sm leading-relaxed max-w-2xl">
        Ta strona używa plików cookie do zapamiętania zawartości koszyka.
        Więcej informacji w{" "}
        <Link to="/polityka-prywatnosci" className="underline hover:text-accent transition-colors">
          Polityce cookies
        </Link>
        .
      </p>
      <div className="flex gap-3 shrink-0">
        <button
          onClick={decline}
          className="font-dm-sans text-sm border border-warm-white px-6 py-2 hover:bg-warm-white hover:text-near-black transition-colors duration-300"
        >
          Odrzuć
        </button>
        <button
          onClick={accept}
          className="font-dm-sans text-sm bg-accent text-near-black px-6 py-2 hover:opacity-90 transition-opacity duration-300"
        >
          Akceptuj
        </button>
      </div>
    </div>
  );
}

export default CookieBanner;
