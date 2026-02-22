import { NavLink } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

type Item = { to: string; label: string };

const navItems: Item[] = [
  { to: "/app", label: "Dashboard" },
  { to: "/app/scrims", label: "Scrims" },
  { to: "/app/strats", label: "Strats" },
  { to: "/app/team", label: "Team" },
  { to: "/app/settings", label: "Settings" },
];

function SideLink({ to, label }: Item) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "block rounded-md px-3 py-2 text-sm transition",
          "text-slate-200 hover:bg-slate-800 hover:text-slate-100",
          isActive ? "bg-slate-800 text-slate-100" : "",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}

export function AppSidebar() {
  return (
    <aside className="h-full w-64 border-r border-slate-800 bg-slate-900">
      <div className="px-4 py-4">
        <div className="text-sm font-semibold tracking-tight text-slate-100">
          Scrimbase
        </div>
        <div className="text-xs text-slate-400">Team workspace</div>
      </div>

      <Separator className="bg-slate-800" />

      <nav className="px-2 py-3 space-y-1">
        {navItems.map((it) => (
          <SideLink key={it.to} {...it} />
        ))}
      </nav>

      <div className="mt-auto px-4 py-4 text-xs text-slate-500">
        v0.1
      </div>
    </aside>
  );
}

export default AppSidebar;