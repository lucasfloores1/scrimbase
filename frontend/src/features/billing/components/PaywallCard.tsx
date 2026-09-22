import { Link } from "react-router-dom";
import { Clock, Sparkles } from "lucide-react";

import { useI18n } from "@/app/providers/I18nProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BillingStatusDto } from "@/shared/types/dto";

export function PaywallCard({ status }: { status: BillingStatusDto }) {
  const { t, formatDate } = useI18n();

  const resetsAt = status.usage.resetsAt
    ? formatDate(status.usage.resetsAt, { dateStyle: "short", timeStyle: "short" })
    : null;

  return (
    <div className="space-y-4 rounded-xl border border-brand/30 bg-brand/5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-brand" />
          <h3 className="text-base font-semibold text-foreground">{t("paywall.title")}</h3>
        </div>
        <Badge variant="outline" className="border-brand/40 bg-brand/10 text-brand">
          {t("paywall.badge")}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">
        {resetsAt ? t("paywall.desc", { when: resetsAt }) : t("paywall.descNoTime")}
      </p>

      {resetsAt ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {t("paywall.resetsAt", { when: resetsAt })}
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild className="bg-brand text-brand-foreground hover:bg-brand-hover">
          <Link to="/app/plans">{t("paywall.cta")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/app/plans">{t("paywall.secondary")}</Link>
        </Button>
      </div>
    </div>
  );
}

export default PaywallCard;
