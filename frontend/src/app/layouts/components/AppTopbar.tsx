import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/app/providers/AuthProvider";
import { Menu } from "lucide-react";

function initials(name?: string, email?: string) {
  const source = name || email || "U";
  return source.slice(0, 2).toUpperCase();
}

export function AppTopbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between gap-3 px-4 md:px-6">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onOpenMobileNav}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="md:hidden font-display text-sm font-semibold tracking-tight">Scrimbase</div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-sm hover:bg-muted transition-colors"
              >
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarFallback className="bg-ink text-[11px] text-signal">
                    {initials(user?.username, user?.email)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[140px] truncate text-muted-foreground lg:inline">
                  {user?.username ?? user?.email}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => navigate("/app/settings")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default AppTopbar;
