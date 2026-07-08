import { NavLink } from "react-router-dom";

function AdminNav() {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 w-full bg-near-black font-dm-sans text-warm-white px-4 py-3 sm:px-6 sm:py-5">
      <h2 className="font-dm-sans uppercase tracking-widest text-sm sm:text-xl px-2 py-2 sm:px-4 sm:py-3 mr-auto">
        Panel admina
      </h2>
      <NavLink
        to="/admin"
        end
        className={({ isActive }) =>
          `text-sm sm:text-xl px-3 py-3 sm:px-4 sm:py-3 min-h-[44px] flex items-center hover:text-accent ${isActive ? "text-accent" : "text-warm-white"}`
        }
      >
        Produkty
      </NavLink>
      <NavLink
        to="/admin/zamowienia"
        className={({ isActive }) =>
          `text-sm sm:text-xl px-3 py-3 sm:px-4 sm:py-3 min-h-[44px] flex items-center hover:text-accent ${isActive ? "text-accent" : "text-warm-white"}`
        }
      >
        Zamówienia
      </NavLink>
      <NavLink
        to="/admin/produkty/nowy"
        className={({ isActive }) =>
          `text-sm sm:text-xl px-3 py-3 sm:px-4 sm:py-3 min-h-[44px] flex items-center hover:text-accent ${isActive ? "text-accent" : "text-warm-white"}`
        }
      >
        Dodaj produkt
      </NavLink>
    </div>
  );
}

export default AdminNav;
