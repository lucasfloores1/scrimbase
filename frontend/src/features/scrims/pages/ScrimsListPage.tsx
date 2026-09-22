import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { useI18n } from "@/app/providers/I18nProvider";
import { scrimsApi } from "@/shared/api/scrims.api";
import type { ScrimDto, ScrimOutcome, ScrimType } from "@/shared/types/dto";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { LoadingState } from "@/shared/ui/feedback/LoadingState";
import { ErrorState } from "@/shared/ui/feedback/ErrorState";
import { EmptyState } from "@/shared/ui/feedback/EmptyState";

const ALL = "__all__";

function outcomeClass(outcome: ScrimOutcome) {
  if (outcome === "WIN") return "bg-success/10 text-success border-success/30";
  if (outcome === "LOSS") return "bg-danger/10 text-danger border-danger/30";
  return "bg-muted text-muted-foreground border-border";
}

export function ScrimsListPage() {
  const navigate = useNavigate();
  const { t, formatDate } = useI18n();
  const { user } = useAuth();
  const teamId = user?.teamMember?.teamId ?? null;

  const [mapFilter, setMapFilter] = React.useState<string>(ALL);
  const [typeFilter, setTypeFilter] = React.useState<string>(ALL);
  const [outcomeFilter, setOutcomeFilter] = React.useState<string>(ALL);

  const query = useQuery({
    queryKey: ["scrims", teamId],
    queryFn: async () => {
      if (!teamId) return [];
      return scrimsApi.list(teamId);
    },
    enabled: !!teamId,
    staleTime: 15_000,
  });

  const scrims = React.useMemo(() => (query.data ?? []) as ScrimDto[], [query.data]);

  const maps = React.useMemo(
    () => Array.from(new Set(scrims.map((s) => s.map))).sort(),
    [scrims]
  );

  const filtered = React.useMemo(
    () =>
      scrims.filter((s) => {
        if (mapFilter !== ALL && s.map !== mapFilter) return false;
        if (typeFilter !== ALL && s.type !== typeFilter) return false;
        if (outcomeFilter !== ALL && s.outcome !== outcomeFilter) return false;
        return true;
      }),
    [scrims, mapFilter, typeFilter, outcomeFilter]
  );

  const outcomeLabel = (outcome: ScrimOutcome) => {
    if (outcome === "WIN") return t("outcome.win");
    if (outcome === "LOSS") return t("outcome.loss");
    return t("outcome.draw");
  };

  const typeLabel = (type: ScrimType) => {
    if (type === "PREMIER") return t("type.premier");
    if (type === "TOURNAMENT") return t("type.tournament");
    return t("type.scrim");
  };

  if (!teamId) {
    return <EmptyState title={t("scrims.noTeam")} description={t("scrims.noTeamDesc")} />;
  }

  if (query.isLoading) {
    return <LoadingState title={t("scrims.loading")} description={t("scrims.loadingDesc")} />;
  }

  if (query.isError) {
    const msg = query.error instanceof Error ? query.error.message : t("common.error");
    return (
      <ErrorState
        title={t("scrims.loadError")}
        description={msg}
        actionLabel={t("common.retry")}
        onAction={() => query.refetch()}
      />
    );
  }

  if (scrims.length === 0) {
    return (
      <EmptyState
        title={t("scrims.empty")}
        description={t("scrims.emptyDesc")}
        actionLabel={t("nav.uploadScrim")}
        onAction={() => navigate("/app/scrims/new")}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Select value={mapFilter} onValueChange={setMapFilter}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder={t("scrims.filterMap")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("scrims.filterMap")}</SelectItem>
            {maps.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder={t("scrims.filterType")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("scrims.filterType")}</SelectItem>
            <SelectItem value="SCRIM">{t("type.scrim")}</SelectItem>
            <SelectItem value="PREMIER">{t("type.premier")}</SelectItem>
            <SelectItem value="TOURNAMENT">{t("type.tournament")}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder={t("scrims.filterOutcome")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("scrims.filterOutcome")}</SelectItem>
            <SelectItem value="WIN">{t("outcome.win")}</SelectItem>
            <SelectItem value="LOSS">{t("outcome.loss")}</SelectItem>
            <SelectItem value="DRAW">{t("outcome.draw")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={t("scrims.noMatches")} description={t("scrims.noMatchesDesc")} />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      {t("scrims.date")}
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      {t("scrims.map")}
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      {t("scrims.type")}
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      {t("scrims.result")}
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      {t("scrims.score")}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((s) => (
                    <tr
                      key={s.id}
                      className="cursor-pointer border-b border-border last:border-0 hover:bg-accent/50"
                      onClick={() => navigate(`/app/scrims/${s.id}`)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-foreground">
                        {formatDate(s.createdAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-foreground">{s.map}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-foreground">
                        {typeLabel(s.type)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant="outline" className={outcomeClass(s.outcome)}>
                          {outcomeLabel(s.outcome)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-foreground">
                        {s.teamRounds}–{s.enemyRounds}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ScrimsListPage;
