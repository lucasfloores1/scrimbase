import { Link } from "react-router-dom";

import { useI18n } from "@/app/providers/I18nProvider";
import { Button } from "@/components/ui/button";
import { env } from "@/shared/config/env";
import { LanguageSwitcher } from "@/shared/ui/components/LanguageSwitcher";
import { ThemeToggle } from "@/shared/ui/components/ThemeToggle";

export function MarketingNavbar() {
  const { t } = useI18n();

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="font-semibold tracking-tight text-foreground">
          Scrimbase
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {env.DEV_BYPASS_AUTH && (
            <Button asChild variant="outline">
              <Link to="/app">Enter demo</Link>
            </Button>
          )}

          <LanguageSwitcher />
          <ThemeToggle />

          <Button asChild variant="ghost">
            <Link to="/login">{t("nav.login")}</Link>
          </Button>

          <Button asChild className="bg-brand text-brand-foreground hover:bg-brand-hover">
            <Link to="/register">{t("nav.register")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
