import { useState, useEffect } from "react";

function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 300);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Przewiń do góry"
      className="fixed bottom-6 right-6 z-50 w-10 h-10 border border-near-black bg-warm-white text-near-black flex items-center justify-center hover:bg-near-black hover:text-warm-white transition-colors duration-300"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}

export default ScrollToTop;
