import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles } from "lucide-react";

import { useI18n } from "@/app/providers/I18nProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { billingApi } from "@/shared/api/billing.api";
import type { BillingCycle, BillingPriceDto } from "@/shared/types/dto";
import type { TranslationKey } from "@/shared/i18n/locales";
import { ErrorState } from "@/shared/ui/feedback/ErrorState";
import { LoadingState } from "@/shared/ui/feedback/LoadingState";
import { cn } from "@/lib/utils";

import { billingQueryKey, useBilling } from "../hooks/useBilling";

const CYCLE_LABEL: Record<BillingCycle, TranslationKey> = {
  MONTHLY: "plans.monthly",
  SEMIANNUAL: "plans.semiannual",
  ANNUAL: "plans.annual",
};

const FREE_FEATURES: TranslationKey[] = ["plans.feature.free1", "plans.feature.free2", "plans.feature.free3"];
const PRO_FEATURES: TranslationKey[] = [
  "plans.feature.pro1",
  "plans.feature.pro2",
  "plans.feature.pro3",
  "plans.feature.pro4",
];

function errorMessage(err: unknown, fallback: string) {
  if (err instanceof Error) return err.message;
  return fallback;
}

export function PlansPage() {
  const { t, formatDate, localeTag } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { teamId, status, isPro, isAdmin, query } = useBilling();

  const [cycle, setCycle] = React.useState<BillingCycle>("MONTHLY");

  const money = React.useCallback(
    (amount: number, currency: string) => {
      try {
        return new Intl.NumberFormat(localeTag, {
          style: "currency",
          currency,
          maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
        }).format(amount);
      } catch {
        return `${currency} ${amount}`;
      }
    },
    [localeTag]
  );

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!teamId) throw new Error("No team");
      return billingApi.startCheckout(teamId, cycle);
    },
    onSuccess: (checkout) => {
      navigate(`/app/plans/checkout/${checkout.checkoutId}`);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!teamId) throw new Error("No team");
      return billingApi.cancel(teamId);
    },
    onSuccess: (next) => queryClient.setQueryData(billingQueryKey(teamId), next),
  });

  const resumeMutation = useMutation({
    mutationFn: async () => {
      if (!teamId) throw new Error("No team");
      return billingApi.resume(teamId);
    },
    onSuccess: (next) => queryClient.setQueryData(billingQueryKey(teamId), next),
  });

  if (query.isLoading) {
    return <LoadingState title={t("common.loading")} />;
  }

  if (query.isError || !status) {
    return (
      <ErrorState
        title={t("plans.loadError")}
        description={errorMessage(query.error, t("common.error"))}
        actionLabel={t("common.retry")}
        onAction={() => query.refetch()}
      />
    );
  }

  const selected = status.prices.find((p) => p.cycle === cycle) ?? status.prices[0];
  const actionError = checkoutMutation.error ?? cancelMutation.error ?? resumeMutation.error;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
          {t("plans.title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("plans.subtitle")}</p>
      </header>

      <Separator />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("plans.currentPlan")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold text-foreground">
                {isPro ? t("plans.pro") : t("plans.free")}
              </span>
              {isPro ? <Sparkles className="h-4 w-4 text-brand" /> : null}
            </div>

            <p className="text-sm text-muted-foreground">
              {isPro
                ? t("plans.usageUnlimited")
                : t("plans.usageToday", {
                    used: status.usage.scrimsToday,
                    limit: status.usage.dailyLimit ?? 1,
                  })}
            </p>

            {isPro && status.currentPeriodEnd ? (
              <p className="text-xs text-muted-foreground">
                {status.cancelAtPeriodEnd
                  ? t("plans.canceled", { date: formatDate(status.currentPeriodEnd) })
                  : t("plans.renewsOn", { date: formatDate(status.currentPeriodEnd) })}
              </p>
            ) : null}
          </div>

          {isPro && isAdmin ? (
            status.cancelAtPeriodEnd ? (
              <Button
                variant="outline"
                disabled={resumeMutation.isPending}
                onClick={() => resumeMutation.mutate()}
              >
                {t("plans.resume")}
              </Button>
            ) : (
              <Button
                variant="outline"
                disabled={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate()}
              >
                {cancelMutation.isPending ? t("plans.canceling") : t("plans.cancel")}
              </Button>
            )
          ) : null}
        </CardContent>
      </Card>

      {actionError ? (
        <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger-foreground">
          {errorMessage(actionError, t("common.error"))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {status.prices.map((price) => (
          <CycleButton
            key={price.cycle}
            price={price}
            active={price.cycle === cycle}
            onSelect={() => setCycle(price.cycle)}
            label={t(CYCLE_LABEL[price.cycle])}
            savingsLabel={price.savingsPercent > 0 ? t("plans.save", { percent: price.savingsPercent }) : null}
          />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className={cn(!isPro && "border-brand/40")}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-foreground">{t("plans.free")}</CardTitle>
              {!isPro ? <Badge variant="outline">{t("plans.current")}</Badge> : null}
            </div>
            <p className="text-sm text-muted-foreground">{t("plans.freeDesc")}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-semibold text-foreground">
              {money(0, selected?.currency ?? "USD")}
            </div>
            <FeatureList items={FREE_FEATURES} />
          </CardContent>
        </Card>

        <Card className={cn("relative overflow-hidden", isPro ? "border-brand/40" : "border-brand/60")}>
          <div className="absolute inset-x-0 top-0 h-1 bg-brand" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base text-foreground">
                {t("plans.pro")}
                <Sparkles className="h-4 w-4 text-brand" />
              </CardTitle>
              {isPro ? <Badge variant="outline">{t("plans.current")}</Badge> : null}
            </div>
            <p className="text-sm text-muted-foreground">{t("plans.proDesc")}</p>
          </CardHeader>

          <CardContent className="space-y-4">
            {selected ? (
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-foreground">
                    {money(selected.pricePerMonth, selected.currency)}
                  </span>
                  <span className="text-sm text-muted-foreground">{t("plans.perMonth")}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {selected.months === 1
                    ? t("plans.billedMonthly")
                    : selected.months === 12
                      ? t("plans.billedYearly")
                      : t("plans.billedEvery", { months: selected.months })}
                  {" · "}
                  {money(selected.amount, selected.currency)}
                </p>
              </div>
            ) : null}

            <FeatureList items={PRO_FEATURES} />

            {isAdmin ? (
              <Button
                className="w-full bg-brand text-brand-foreground hover:bg-brand-hover"
                disabled={checkoutMutation.isPending || (isPro && !status.cancelAtPeriodEnd)}
                onClick={() => checkoutMutation.mutate()}
              >
                {isPro && !status.cancelAtPeriodEnd ? t("plans.current") : t("plans.upgrade")}
              </Button>
            ) : (
              <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                {t("plans.adminOnly")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CycleButton({
  price,
  active,
  label,
  savingsLabel,
  onSelect,
}: {
  price: BillingPriceDto;
  active: boolean;
  label: string;
  savingsLabel: string | null;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors",
        active
          ? "border-brand bg-brand/10 text-foreground"
          : "border-border text-muted-foreground hover:bg-accent"
      )}
    >
      <span>{label}</span>
      {savingsLabel ? (
        <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
          {savingsLabel}
        </span>
      ) : null}
      <span className="sr-only">{price.cycle}</span>
    </button>
  );
}

function FeatureList({ items }: { items: TranslationKey[] }) {
  const { t } = useI18n();

  return (
    <ul className="space-y-2">
      {items.map((key) => (
        <li key={key} className="flex items-start gap-2 text-sm text-muted-foreground">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          {t(key)}
        </li>
      ))}
    </ul>
  );
}

export default PlansPage;
