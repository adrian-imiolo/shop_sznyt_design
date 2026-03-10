function Footer() {
  return (
    <footer className="bg-warm-white border-t border-borders px-6 py-20">
      <div className="max-w-6xl mx-auto">
        {/* Main row */}
        <div className="flex flex-col md:flex-row justify-between gap-16 mb-16">
          {/* Brand */}
          <div className="max-w-xs">
            <a className="font-cormorant text-2xl text-near-black tracking-wide block mb-3">
              Sznyt Design
            </a>
            <p className="font-dm-sans text-sm text-secondary-text leading-relaxed">
              Minimalizm. Jakość. Trwałość.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-32">
            <div className="flex flex-col gap-4">
              <p className="font-dm-sans text-xs text-accent tracking-[0.2em] uppercase mb-1">
                Linki
              </p>
              <a
                href="#"
                className="font-dm-sans text-sm text-near-black hover:text-accent transition-colors"
              >
                Sklep
              </a>
              <a
                href="#"
                className="font-dm-sans text-sm text-near-black hover:text-accent transition-colors"
              >
                O nas
              </a>
              <a
                href="#"
                className="font-dm-sans text-sm text-near-black hover:text-accent transition-colors"
              >
                Kontakt
              </a>
            </div>
            <div className="flex flex-col gap-4">
              <p className="font-dm-sans text-xs text-accent tracking-[0.2em] uppercase mb-1">
                Social
              </p>
              <a
                href="#"
                className="font-dm-sans text-sm text-near-black hover:text-accent transition-colors"
              >
                Instagram
              </a>
              <a
                href="#"
                className="font-dm-sans text-sm text-near-black hover:text-accent transition-colors"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-borders pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-dm-sans text-xs text-secondary-text">
            © 2025 Sznyt Design
          </p>
          <div className="flex gap-8">
            <a
              href="#"
              className="font-dm-sans text-xs text-secondary-text hover:text-near-black transition-colors"
            >
              Polityka prywatności
            </a>
            <a
              href="#"
              className="font-dm-sans text-xs text-secondary-text hover:text-near-black transition-colors"
            >
              Regulamin
            </a>
            <a
              href="#"
              className="font-dm-sans text-xs text-secondary-text hover:text-near-black transition-colors"
            >
              FAQ
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
