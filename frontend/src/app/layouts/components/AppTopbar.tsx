import { useNavigate } from "react-router-dom";
import { Menu, Plus } from "lucide-react";

import { useAuth } from "@/app/providers/AuthProvider";
import { useI18n } from "@/app/providers/I18nProvider";
import { PlanPill } from "@/features/billing/components/PlanPill";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageSwitcher } from "@/shared/ui/components/LanguageSwitcher";
import { ThemeToggle } from "@/shared/ui/components/ThemeToggle";

function initials(value?: string) {
  if (!value) return "U";
  return value.slice(0, 2).toUpperCase();
}

export function AppTopbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-label={t("nav.menu")}
            onClick={onOpenMobileNav}
          >
            <Menu className="h-4 w-4" />
          </Button>

          <div className="text-sm font-semibold tracking-tight text-foreground">Scrimbase</div>
          <PlanPill className="hidden sm:inline-flex" />
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            className="bg-brand text-brand-foreground hover:bg-brand-hover"
            onClick={() => navigate("/app/scrims/new")}
          >
            <Plus className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">{t("nav.uploadScrim")}</span>
          </Button>

          <LanguageSwitcher />
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-foreground hover:bg-accent">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{initials(user?.username ?? user?.email)}</AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[12rem] truncate lg:inline">{user?.email}</span>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/app/plans")}>{t("nav.plans")}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/app/settings")}>
                {t("nav.settings")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>{t("nav.logout")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default AppTopbar;
