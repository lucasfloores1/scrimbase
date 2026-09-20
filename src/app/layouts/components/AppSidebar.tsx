import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, Plus, Settings } from "lucide-react";
import { navItems } from "./nav";
import { useAuth } from "@/app/providers/AuthProvider";
import { useMyTeam } from "@/shared/hooks/useTeam";
import { initials } from "@/shared/lib/format";
import { BrandMark } from "@/shared/ui/brand/BrandMark";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/** Riel de íconos: logo, equipo, secciones y la acción principal abajo. */
export function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const team = useMyTeam();
  const displayName = user?.username || user?.email || "Usuario";

  return (
    <aside className="sticky top-0 hidden h-screen w-20 shrink-0 flex-col items-center border-r border-white/[0.07] bg-sidebar py-6 md:flex">
      <Link to="/app" aria-label="Scrimbase" className="outline-none focus-visible:ring-3 focus-visible:ring-ring/60">
        <BrandMark className="size-8 text-primary" />
      </Link>

      {team.data ? (
        <Link
          to="/app/team"
          title={team.data.name}
          className="mt-7 flex size-11 items-center justify-center rounded-md border border-primary/40 bg-primary/12 font-display text-sm font-semibold tracking-wide text-primary outline-none hover:bg-primary/20 focus-visible:ring-3 focus-visible:ring-ring/60"
        >
          {team.data.tag}
        </Link>
      ) : null}

      <nav className="mt-8 flex flex-col gap-1.5" aria-label="Secciones">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            aria-label={label}
            title={label}
            className={({ isActive }) =>
              cn(
                "relative flex size-11 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/60",
                isActive
                  ? "bg-sidebar-accent text-foreground"
                  : "text-sidebar-foreground/55 hover:bg-sidebar-accent/60 hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="size-5" />
                {isActive ? <span className="bg-plasma absolute inset-y-1.5 left-0 w-[3px] rounded-full" aria-hidden="true" /> : null}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <Link
        to="/app/scrims/new"
        aria-label="Subir scrim"
        title="Subir scrim"
        className="bg-plasma glow-plasma mt-auto flex size-11 items-center justify-center rounded-md text-white transition-opacity outline-none hover:opacity-90 focus-visible:ring-3 focus-visible:ring-ring/60"
      >
        <Plus className="size-5" />
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="mt-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/60"
            aria-label="Menú de usuario"
          >
            <Avatar className="size-10 rounded-md border border-white/10">
              <AvatarFallback className="rounded-md bg-surface-2 text-xs">{initials(displayName)}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.riotId ?? user?.email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/app/settings")}>
            <Settings />
            Configuración
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          >
            <LogOut />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </aside>
  );
}

export default AppSidebar;
