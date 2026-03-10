import { useState } from "react";

const navLinks = [
  { label: "Sklep", href: "#" },
  { label: "O nas", href: "#" },
  { label: "Kontakt", href: "#" },
];

function Navbar() {
  const [toggleMenu, setToggleMenu] = useState(false);

  return (
    <nav className="bg-warm-white border-b border-borders px-6 py-4">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <a className="font-cormorant text-2xl text-near-black tracking-wide">
          Sznyt Design
        </a>
        <ul className="hidden md:flex gap-8">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a href={link.href} className="font-dm-sans text-sm text-near-black hover:text-accent tracking-widest uppercase">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <button
          className="block md:hidden flex flex-col gap-1"
          onClick={() => setToggleMenu(!toggleMenu)}
        >
          <span className="block w-6 h-px bg-near-black"></span>
          <span className="block w-6 h-px bg-near-black"></span>
          <span className="block w-6 h-px bg-near-black"></span>
        </button>
      </div>
      {toggleMenu && (
        <div className="md:hidden mt-4 px-2 pb-4">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="font-dm-sans text-sm text-near-black hover:text-accent tracking-widest uppercase">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
