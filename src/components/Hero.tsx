import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="relative min-h-screen flex items-end bg-near-black">
      {/* Placeholder — replace with a real photo later */}
      <div className="absolute inset-0 bg-[#2a2420]" />

      {/* Gradient overlay so text is readable over the image */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Text content — bottom-left, zieta.pl style */}
      <div className="relative z-10 max-w-6xl mx-auto w-full px-6 pb-16 md:pb-20">
        <p className="font-dm-sans text-xs text-accent tracking-[0.3em] uppercase mb-4">
          Sznyt Design
        </p>
        <h1 className="font-cormorant text-5xl md:text-7xl text-warm-white font-light leading-tight mb-6">
          Rama, która
          <br />
          staje się sztuką
        </h1>
        <Link
          to="/sklep"
          className="inline-block font-dm-sans text-sm text-warm-white border border-warm-white/50 px-8 py-3 hover:bg-warm-white hover:text-near-black transition-colors duration-300"
        >
          Zobacz kolekcję
        </Link>
      </div>

      {/* Scroll indicator — bouncing arrow, bottom center */}
      <div
        className="cursor-pointer absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        onClick={() =>
          document
            .getElementById("kolekcja")
            ?.scrollIntoView({ behavior: "smooth" })
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-warm-white/50"
        >
          <path d="M12 5v14M5 13l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
}

export default Hero;
