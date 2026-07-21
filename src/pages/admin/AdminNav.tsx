import { NavLink } from "react-router-dom";
import { UserButton, useUser } from "@clerk/react";

function AdminNav() {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 w-full bg-near-black font-dm-sans text-warm-white px-4 py-3 sm:px-6 sm:py-5">
      <h2 className="max-sm:basis-full font-dm-sans uppercase tracking-widest text-sm sm:text-xl px-2 py-2 sm:px-4 sm:py-3 mr-auto">
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
      {/* max-sm:ml-auto — below sm the group wraps onto its own row; keep it
          right-aligned there without disturbing the desktop row */}
      <div className="flex items-center gap-3 min-h-[44px] max-sm:ml-auto pl-1 sm:pl-3">
        {email && (
          <span
            className="hidden sm:block max-w-[16rem] truncate font-dm-sans text-sm text-warm-white/70"
            title={email}
          >
            {email}
          </span>
        )}
        <UserButton
          appearance={{
            elements: {
              // 28 + 2*8 = a 44 px touch target. The avatar size is pinned
              // rather than inherited so a Clerk default change can't shrink
              // the target below 44. Style objects, not Tailwind classes —
              // classes here lose to Clerk's own rules.
              userButtonAvatarBox: { width: "28px", height: "28px" },
              userButtonTrigger: { padding: "8px" },
            },
          }}
        />
      </div>
    </div>
  );
}

export default AdminNav;
