import { NavLink } from "react-router-dom";
import { CreditCard, LayoutDashboard, Settings, Swords, Target, Users } from "lucide-react";

import { useI18n } from "@/app/providers/I18nProvider";
import { PlanPill } from "@/features/billing/components/PlanPill";
import { Separator } from "@/components/ui/separator";
import type { TranslationKey } from "@/shared/i18n/locales";
import { cn } from "@/lib/utils";

type Item = { to: string; labelKey: TranslationKey; icon: typeof Swords; end?: boolean };

const navItems: Item[] = [
  { to: "/app", labelKey: "nav.dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/scrims", labelKey: "nav.scrims", icon: Swords },
  { to: "/app/strats", labelKey: "nav.strats", icon: Target },
  { to: "/app/team", labelKey: "nav.team", icon: Users },
  { to: "/app/plans", labelKey: "nav.plans", icon: CreditCard },
  { to: "/app/settings", labelKey: "nav.settings", icon: Settings },
];

function SideLink({ to, labelKey, icon: Icon, end }: Item) {
  const { t } = useI18n();

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
          isActive
            ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
            : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
        )
      }
    >
      <Icon className="h-4 w-4" />
      {t(labelKey)}
    </NavLink>
  );
}

export function AppSidebar() {
  const { t } = useI18n();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="space-y-2 px-4 py-4">
        <div>
          <div className="text-sm font-semibold tracking-tight text-sidebar-foreground">Scrimbase</div>
          <div className="text-xs text-muted-foreground">{t("nav.workspace")}</div>
        </div>
        <PlanPill />
      </div>

      <Separator className="bg-sidebar-border" />

      <nav className="space-y-1 px-2 py-3">
        {navItems.map((item) => (
          <SideLink key={item.to} {...item} />
        ))}
      </nav>

      <div className="mt-auto px-4 py-4 text-xs text-muted-foreground">v0.1</div>
    </aside>
  );
}

export default AppSidebar;
