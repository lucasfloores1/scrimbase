import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";

import { useI18n } from "@/app/providers/I18nProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { billingApi } from "@/shared/api/billing.api";
import type { BillingCycle, BillingStatusDto } from "@/shared/types/dto";
import type { TranslationKey } from "@/shared/i18n/locales";
import { ErrorState } from "@/shared/ui/feedback/ErrorState";
import { LoadingState } from "@/shared/ui/feedback/LoadingState";

import { billingQueryKey, useBilling } from "../hooks/useBilling";

const CYCLE_LABEL: Record<BillingCycle, TranslationKey> = {
  MONTHLY: "plans.monthly",
  SEMIANNUAL: "plans.semiannual",
  ANNUAL: "plans.annual",
};

function errorMessage(err: unknown, fallback: string) {
  if (err instanceof Error) return err.message;
  return fallback;
}

export function CheckoutPage() {
  const { checkoutId } = useParams<{ checkoutId: string }>();
  const { t, formatDate, localeTag } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { teamId } = useBilling();

  const [result, setResult] = React.useState<BillingStatusDto | null>(null);

  const checkoutQuery = useQuery({
    queryKey: ["billing", "checkout", teamId, checkoutId],
    queryFn: async () => {
      if (!teamId || !checkoutId) throw new Error("No checkout");
      return billingApi.getCheckout(teamId, checkoutId);
    },
    enabled: !!teamId && !!checkoutId,
    retry: false,
  });

  const payMutation = useMutation({
    mutationFn: async () => {
      if (!teamId || !checkoutId) throw new Error("No checkout");
      return billingApi.confirmCheckout(teamId, checkoutId);
    },
    onSuccess: (next) => {
      queryClient.setQueryData(billingQueryKey(teamId), next);
      setResult(next);
    },
  });

  const money = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat(localeTag, {
        style: "currency",
        currency,
        maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
      }).format(amount);
    } catch {
      return `${currency} ${amount}`;
    }
  };

  if (checkoutQuery.isLoading) return <LoadingState title={t("common.loading")} />;

  if (checkoutQuery.isError || !checkoutQuery.data) {
    return (
      <ErrorState
        title={t("checkout.notFound")}
        description={errorMessage(checkoutQuery.error, t("common.error"))}
        actionLabel={t("paywall.secondary")}
        onAction={() => navigate("/app/plans")}
      />
    );
  }

  const checkout = checkoutQuery.data;

  if (result) {
    return (
      <div className="mx-auto max-w-md space-y-5 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-foreground">{t("checkout.success")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("checkout.successDesc", { date: formatDate(result.currentPeriodEnd) })}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild className="bg-brand text-brand-foreground hover:bg-brand-hover">
            <Link to="/app/scrims/new">{t("checkout.goToScrims")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/app/plans">{t("plans.title")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (checkout.status === "EXPIRED") {
    return (
      <ErrorState
        title={t("checkout.expired")}
        description={t("checkout.expiredDesc")}
        actionLabel={t("paywall.secondary")}
        onAction={() => navigate("/app/plans")}
      />
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-5">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{t("checkout.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("checkout.subtitle")}</p>
      </header>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            Scrimbase PRO
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Row label={t("checkout.plan")} value={t("plans.pro")} />
          <Row label={t("checkout.cycle")} value={t(CYCLE_LABEL[checkout.cycle])} />
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("checkout.total")}</span>
            <span className="text-2xl font-semibold text-foreground">
              {money(checkout.amount, checkout.currency)}
            </span>
          </div>

          {payMutation.isError ? (
            <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger-foreground">
              {errorMessage(payMutation.error, t("common.error"))}
            </div>
          ) : null}

          <Button
            className="w-full bg-brand text-brand-foreground hover:bg-brand-hover"
            disabled={payMutation.isPending}
            onClick={() => payMutation.mutate()}
          >
            {payMutation.isPending
              ? t("checkout.paying")
              : t("checkout.pay", { amount: money(checkout.amount, checkout.currency) })}
          </Button>

          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {t("checkout.mockNotice")}
          </div>
        </CardContent>
      </Card>

      <Button asChild variant="ghost" className="w-full">
        <Link to="/app/plans">{t("common.back")}</Link>
      </Button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

export default CheckoutPage;
