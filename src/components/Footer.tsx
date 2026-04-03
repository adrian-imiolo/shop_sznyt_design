import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-near-black px-6 py-12 md:py-20">
      <div className="max-w-6xl mx-auto">
        {/* Main row */}
        <div className="flex flex-col md:flex-row justify-between gap-12 md:gap-16 mb-12 md:mb-16">

          {/* Brand */}
          <div className="max-w-xs text-center md:text-left">
            <Link
              to="/"
              className="font-cormorant text-2xl text-warm-white tracking-wide block mb-3"
            >
              Sznyt Design
            </Link>
            <p className="font-dm-sans text-sm text-secondary-text leading-relaxed mb-4">
              Ramy z charakterem. Projektowane z myślą o trwałości, nie trendach.
            </p>
            <a
              href="mailto:kontakt@sznytdesign.pl"
              className="font-dm-sans text-xs text-accent hover:text-warm-white transition-colors tracking-wide"
            >
              kontakt@sznytdesign.pl
            </a>
          </div>

          {/* Links */}
          <div className="flex justify-center md:justify-end gap-16 md:gap-24">
            <div className="flex flex-col gap-4">
              <p className="font-dm-sans text-xs text-accent tracking-[0.2em] uppercase mb-1">
                Sklep
              </p>
              <Link
                to="/sklep"
                className="font-dm-sans text-sm text-secondary-text hover:text-warm-white transition-colors"
              >
                Kolekcja
              </Link>
              <Link
                to="/o-nas"
                className="font-dm-sans text-sm text-secondary-text hover:text-warm-white transition-colors"
              >
                O nas
              </Link>
              <Link
                to="/kontakt"
                className="font-dm-sans text-sm text-secondary-text hover:text-warm-white transition-colors"
              >
                Kontakt
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <p className="font-dm-sans text-xs text-accent tracking-[0.2em] uppercase mb-1">
                Informacje
              </p>
              <Link
                to="/regulamin"
                className="font-dm-sans text-sm text-secondary-text hover:text-warm-white transition-colors"
              >
                Regulamin
              </Link>
              <Link
                to="/polityka-prywatnosci"
                className="font-dm-sans text-sm text-secondary-text hover:text-warm-white transition-colors"
              >
                Polityka prywatności
              </Link>
              <Link
                to="/zwroty"
                className="font-dm-sans text-sm text-secondary-text hover:text-warm-white transition-colors"
              >
                Zwroty
              </Link>
              <Link
                to="/faq"
                className="font-dm-sans text-sm text-secondary-text hover:text-warm-white transition-colors"
              >
                FAQ
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <p className="font-dm-sans text-xs text-accent tracking-[0.2em] uppercase mb-1">
                Social
              </p>
              <a
                href="#"
                className="font-dm-sans text-sm text-secondary-text hover:text-warm-white transition-colors"
              >
                Instagram
              </a>
              <a
                href="#"
                className="font-dm-sans text-sm text-secondary-text hover:text-warm-white transition-colors"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-borders/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-dm-sans text-xs text-secondary-text">
            © 2026 Sznyt Design. Wszelkie prawa zastrzeżone.
          </p>
          <p className="font-dm-sans text-xs text-secondary-text">
            Szczecin, Polska
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
