import { Link, useNavigate } from "react-router-dom";
import { LogOut, Plus, Settings } from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";
import { initials } from "@/shared/lib/format";
import { BrandMark } from "@/shared/ui/brand/BrandMark";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Barra superior solo en mobile; en desktop el riel lateral ya tiene todo. */
export function AppTopbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.username || user?.email || "Usuario";

  return (
    <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-background/85 backdrop-blur md:hidden">
      <div className="flex h-14 items-center justify-between gap-3 px-4">
        <Link to="/app" className="flex items-center gap-2" aria-label="Scrimbase">
          <BrandMark className="size-6 text-foreground" />
        </Link>

        <div className="flex items-center gap-2">
          <Button asChild size="icon-sm" className="bg-plasma border-0 text-white">
            <Link to="/app/scrims/new" aria-label="Subir scrim">
              <Plus />
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50" aria-label="Menú de usuario">
                <Avatar className="size-8 rounded-md border border-white/10">
                  <AvatarFallback className="rounded-md bg-surface-2 text-xs">{initials(displayName)}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
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
        </div>
      </div>
    </header>
  );
}

export default AppTopbar;
