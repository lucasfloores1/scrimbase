import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

import { useI18n } from "@/app/providers/I18nProvider";
import { cn } from "@/lib/utils";
import { useBilling } from "../hooks/useBilling";

export function PlanPill({ className }: { className?: string }) {
  const { t } = useI18n();
  const { status, isPro } = useBilling();

  if (!status) return null;

  const usage = status.usage;

  const label = isPro
    ? t("plans.pro")
    : usage.dailyLimit !== null
      ? `${t("plans.free")} · ${usage.scrimsToday}/${usage.dailyLimit}`
      : t("plans.free");

  return (
    <Link
      to="/app/plans"
      title={
        isPro
          ? t("plans.usageUnlimited")
          : t("plans.usageToday", { used: usage.scrimsToday, limit: usage.dailyLimit ?? 1 })
      }
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        isPro
          ? "border-brand/40 bg-brand/10 text-brand hover:bg-brand/20"
          : "border-border bg-muted/40 text-muted-foreground hover:bg-muted",
        className
      )}
    >
      {isPro ? <Sparkles className="h-3 w-3" /> : null}
      {label}
    </Link>
  );
}

export default PlanPill;
