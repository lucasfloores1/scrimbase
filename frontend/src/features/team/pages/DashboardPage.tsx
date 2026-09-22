import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import { useI18n } from "@/app/providers/I18nProvider";
import { PaywallCard } from "@/features/billing/components/PaywallCard";
import { useBilling } from "@/features/billing/hooks/useBilling";
import { dashboardApi } from "@/shared/api/dashboard.api";
import type { DashboardResponseDto, ScrimOutcome } from "@/shared/types/dto";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { LoadingState } from "@/shared/ui/feedback/LoadingState";
import { ErrorState } from "@/shared/ui/feedback/ErrorState";
import { EmptyState } from "@/shared/ui/feedback/EmptyState";

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const percent = value <= 1 ? value * 100 : value;
  return Math.max(0, Math.min(100, percent));
}

function formatPercent(value: number): string {
  return `${clampPercent(value).toFixed(0)}%`;
}

function outcomeClass(outcome: ScrimOutcome) {
  if (outcome === "WIN") return "bg-success/10 text-success border-success/30";
  if (outcome === "LOSS") return "bg-danger/10 text-danger border-danger/30";
  return "bg-muted text-muted-foreground border-border";
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { t, formatDate } = useI18n();
  const billing = useBilling();

  const dashboardQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.myTeamDashboard,
    staleTime: 30_000,
  });

  const outcomeLabel = (outcome: ScrimOutcome) => {
    if (outcome === "WIN") return t("outcome.win");
    if (outcome === "LOSS") return t("outcome.loss");
    return t("outcome.draw");
  };

  if (dashboardQuery.isLoading) {
    return <LoadingState title={t("dashboard.loading")} description={t("dashboard.loadingDesc")} />;
  }

  if (dashboardQuery.isError) {
    const message =
      dashboardQuery.error instanceof Error ? dashboardQuery.error.message : t("common.error");

    return (
      <ErrorState
        title={t("dashboard.loadError")}
        description={message}
        actionLabel={t("common.retry")}
        onAction={() => dashboardQuery.refetch()}
      />
    );
  }

  const data = dashboardQuery.data as DashboardResponseDto;

  const teamName = data?.team?.name ?? t("nav.team");
  const overview = data?.overview;
  const last10 = data?.last10;
  const bestMap = data?.bestMap ?? null;
  const recentScrims = Array.isArray(data?.recentScrims) ? data.recentScrims : [];

  const winrate = typeof overview?.winrate === "number" ? overview.winrate : 0;
  const totalScrims = typeof overview?.total === "number" ? overview.total : 0;
  const roundDiff = typeof overview?.roundDiff === "number" ? overview.roundDiff : 0;

  const showPaywall = billing.status ? !billing.status.canUploadScrim : false;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            {teamName}
          </h1>
          <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>

        <Button
          className="bg-brand text-brand-foreground hover:bg-brand-hover"
          onClick={() => navigate("/app/scrims/new")}
        >
          <Plus className="mr-1 h-4 w-4" />
          {t("nav.uploadScrim")}
        </Button>
      </header>

      <Separator />

      {showPaywall && billing.status ? <PaywallCard status={billing.status} /> : null}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi title={t("dashboard.winrate")} value={formatPercent(winrate)}>
          {overview ? (
            <span>
              {overview.wins}W · {overview.losses}L · {overview.draws}D
            </span>
          ) : null}
        </Kpi>

        <Kpi title={t("dashboard.totalScrims")} value={String(totalScrims)} />

        <Kpi
          title={t("dashboard.last10")}
          value={last10 ? formatPercent(last10.winrate) : "—"}
        >
          {last10 ? (
            <span>
              {last10.wins}W · {last10.losses}L · {last10.draws}D
            </span>
          ) : null}
        </Kpi>

        <Kpi
          title={t("dashboard.roundDiff")}
          value={`${roundDiff > 0 ? "+" : ""}${roundDiff}`}
        />
      </section>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("dashboard.bestMap")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bestMap ? (
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-lg font-semibold text-foreground">{bestMap.name}</div>
                <p className="text-xs text-muted-foreground">
                  {t("dashboard.basedOn", { count: bestMap.matches })}
                </p>
              </div>
              <Badge variant="outline" className="border-brand/30 bg-brand/10 text-brand">
                {formatPercent(bestMap.winrate)}
              </Badge>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("dashboard.notEnough")}</p>
          )}
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">{t("dashboard.recent")}</h2>
          <Button variant="outline" onClick={() => navigate("/app/scrims")}>
            {t("dashboard.seeAll")}
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {recentScrims.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title={t("scrims.empty")}
                  description={t("scrims.emptyDesc")}
                  actionLabel={t("nav.uploadScrim")}
                  onAction={() => navigate("/app/scrims/new")}
                />
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <Th>{t("scrims.date")}</Th>
                      <Th>{t("scrims.map")}</Th>
                      <Th>{t("scrims.type")}</Th>
                      <Th>{t("scrims.result")}</Th>
                      <Th>{t("scrims.score")}</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentScrims.map((s) => (
                      <tr
                        key={s.id}
                        className="cursor-pointer border-b border-border last:border-0 hover:bg-accent/50"
                        onClick={() => navigate(`/app/scrims/${s.id}`)}
                      >
                        <Td>{formatDate(s.createdAt)}</Td>
                        <Td>{s.map}</Td>
                        <Td>{s.type}</Td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge variant="outline" className={outcomeClass(s.outcome)}>
                            {outcomeLabel(s.outcome)}
                          </Badge>
                        </td>
                        <Td>
                          {s.teamRounds}–{s.enemyRounds}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Kpi({
  title,
  value,
  children,
}: {
  title: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold text-foreground">{value}</div>
        {children ? <p className="mt-1 text-xs text-muted-foreground">{children}</p> : null}
      </CardContent>
    </Card>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-left font-medium text-muted-foreground">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 whitespace-nowrap text-foreground">{children}</td>;
}

export default DashboardPage;
