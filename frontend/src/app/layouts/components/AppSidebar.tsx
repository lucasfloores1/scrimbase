import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Swords,
  Map,
  Users,
  Settings,
} from "lucide-react";

const navItems = [
  { to: "/app", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/app/scrims", label: "Scrims", icon: Swords },
  { to: "/app/strats", label: "Strats", icon: Map },
  { to: "/app/team", label: "Roster", icon: Users },
  { to: "/app/settings", label: "Settings", icon: Settings },
] as const;

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();

  return (
    <aside className="flex h-full w-56 flex-col bg-sidebar text-sidebar-foreground">
      <button
        type="button"
        onClick={() => {
          navigate("/app");
          onNavigate?.();
        }}
        className="flex items-center gap-2.5 px-5 py-5 text-left"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink text-[11px] font-bold text-signal">
          SB
        </span>
        <span className="font-display text-sm font-semibold tracking-tight">Scrimbase</span>
      </button>

      <nav className="flex flex-1 flex-col gap-0.5 px-3 pb-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={"end" in item ? item.end : false}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent font-medium text-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground",
              )
            }
          >
            <item.icon className="h-4 w-4 opacity-70" strokeWidth={1.75} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-5 py-4">
        <p className="text-[11px] text-muted-foreground tracking-wide">Team workspace</p>
      </div>
    </aside>
  );
}

export default AppSidebar;
