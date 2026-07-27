import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/app/providers/AuthProvider";

function initials(email?: string) {
  if (!email) return "U";
  return email.slice(0, 2).toUpperCase();
}

export function AppTopbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {/* Mobile: botón para abrir sidebar (drawer) */}
          <Button
            variant="outline"
            className="border-slate-800 bg-slate-950 text-slate-200 hover:bg-slate-900 md:hidden"
            onClick={onOpenMobileNav}
          >
            Menu
          </Button>

          <div className="hidden md:block">
            <div className="text-sm font-semibold text-slate-100">Dashboard</div>
            <div className="text-xs text-slate-400">
              TeamId: {user?.teamMember?.teamId ?? "—"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700">
            Upload scrim
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-slate-200 hover:bg-slate-900">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{initials(user?.email)}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">{user?.email}</span>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
              <DropdownMenuItem
                onClick={() => navigate("/app/settings")}
                className="text-slate-200 focus:bg-slate-800 focus:text-slate-100"
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-slate-200 focus:bg-slate-800 focus:text-slate-100"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default AppTopbar;