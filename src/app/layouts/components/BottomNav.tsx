import { NavLink } from "react-router-dom";
import { navItems } from "./nav";
import { cn } from "@/lib/utils";

/** Navegación inferior para mobile. */
export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.07] bg-sidebar/95 backdrop-blur md:hidden">
      <ul className="grid grid-cols-5">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] text-[11px]",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn("size-5", isActive && "text-primary")} />
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default BottomNav;
