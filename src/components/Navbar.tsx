import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Show, SignInButton, UserButton } from "@clerk/react";

const navLinks = [
  { label: "Sklep", to: "/sklep" },
  { label: "O nas", to: "/o-nas" },
  { label: "Kontakt", to: "/kontakt" },
];

function Navbar() {
  const [toggleMenu, setToggleMenu] = useState(false);
  const { totalItems } = useCart();

  return (
    <nav className="bg-warm-white border-b border-borders px-6 py-4">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <Link
          to="/"
          className="font-cormorant text-2xl text-near-black tracking-wide"
        >
          Sznyt Design
        </Link>
        <div className="flex items-center gap-8">
          <ul className="hidden md:flex gap-8">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="font-dm-sans text-sm text-near-black hover:text-accent tracking-widest uppercase"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-6">
            <Show when="signed-out">
              <div className="border border-borders px-3 md:px-6">
                <SignInButton mode="modal">
                  <button className="font-dm-sans text-sm text-near-black hover:text-accent tracking-widest uppercase cursor-pointer">
                    Zaloguj
                  </button>
                </SignInButton>
              </div>
            </Show>
            <Show when="signed-in">
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="Moje zamówienia"
                    labelIcon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                        <rect x="9" y="3" width="6" height="4" rx="1" />
                        <path d="M9 12h6M9 16h4" />
                      </svg>
                    }
                    href="/moje-zamowienia"
                  />
                </UserButton.MenuItems>
              </UserButton>
            </Show>
            <Link
              to="/koszyk"
              className="relative text-near-black hover:text-accent transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-warm-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-dm-sans">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              className="md:hidden flex flex-col gap-1"
              onClick={() => setToggleMenu(!toggleMenu)}
            >
              <span className="block w-6 h-px bg-near-black"></span>
              <span className="block w-6 h-px bg-near-black"></span>
              <span className="block w-6 h-px bg-near-black"></span>
            </button>
          </div>
        </div>
      </div>

      {toggleMenu && (
        <div className="md:hidden mt-4 px-2 pb-4">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  onClick={() => setToggleMenu(false)}
                  className="font-dm-sans text-sm text-near-black hover:text-accent tracking-widest uppercase"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
