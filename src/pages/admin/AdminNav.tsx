import { NavLink } from "react-router-dom";

function AdminNav() {
  return (
    <div className="flex justify-between py-5 w-full bg-near-black text-xl font-dm-sans text-warm-white">
      <h2 className="font-dm-sans uppercase tracking-widest p-6">
        Panel admina
      </h2>
      <NavLink
        to="/admin"
        end
        className={({ isActive }) =>
          ` p-6 mr-5  hover:text-accent ${isActive ? "text-accent" : "text-warm-white"}`
        }
      >
        Produkty
      </NavLink>
      <NavLink
        to="/admin/zamowienia"
        className={({ isActive }) =>
          `p-6 mr-5  hover:text-accent ${isActive ? "text-accent" : "text-warm-white"}`
        }
      >
        Zamówienia
      </NavLink>
      <NavLink
        to="/admin/produkty/nowy"
        className={({ isActive }) =>
          ` p-6 mr-5  hover:text-accent ${isActive ? "text-accent" : "text-warm-white"}`
        }
      >
        Dodaj produkt
      </NavLink>
    </div>
  );
}

export default AdminNav;
