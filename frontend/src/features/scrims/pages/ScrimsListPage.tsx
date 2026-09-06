import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { scrimsApi } from "@/shared/api/scrims.api";
import { VALORANT_MAPS, type ValorantMap, type ValorantAgentOrUnknown } from "@/shared/constants/valorant";
import type { ListScrimsQuery, ScrimDto, ScrimOutcome, ScrimType } from "@/shared/types/dto";
import { OutcomePill } from "@/shared/ui/OutcomePill";
import { LoadingState } from "@/shared/ui/feedback/LoadingState";
import { ErrorState } from "@/shared/ui/feedback/ErrorState";
import { EmptyState } from "@/shared/ui/feedback/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

function formatDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function ScrimsListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const teamId = user?.teamMember?.teamId;

  const [map, setMap] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [outcome, setOutcome] = useState<string>("all");
  const [opponentName, setOpponentName] = useState("");
  const [agentsText, setAgentsText] = useState("");
  const [limit, setLimit] = useState<string>("all");

  const queryFilters: ListScrimsQuery = useMemo(() => {
    const filters: ListScrimsQuery = {};
    if (map !== "all") filters.map = map as ValorantMap;
    if (type !== "all") filters.type = type as ScrimType;
    if (outcome !== "all") filters.outcome = outcome as ScrimOutcome;
    if (opponentName.trim()) filters.opponentName = opponentName.trim();
    if (limit !== "all") filters.limit = Number(limit);

    const agents = agentsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (agents.length) filters.agents = agents as ValorantAgentOrUnknown[];

    return filters;
  }, [map, type, outcome, opponentName, agentsText, limit]);

  const query = useQuery({
    queryKey: ["scrims", teamId, queryFilters],
    queryFn: () => scrimsApi.list(teamId!, queryFilters),
    enabled: Boolean(teamId),
  });

  if (!teamId) {
    return <EmptyState title="No team" description="Join a team to see scrims." />;
  }

  if (query.isLoading) return <LoadingState title="Loading scrims" />;

  if (query.isError) {
    return (
      <ErrorState
        title="Could not load scrims"
        description={query.error instanceof Error ? query.error.message : "Error"}
        actionLabel="Retry"
        onAction={() => query.refetch()}
      />
    );
  }

  const scrims = (query.data ?? []) as ScrimDto[];

  function clearFilters() {
    setMap("all");
    setType("all");
    setOutcome("all");
    setOpponentName("");
    setAgentsText("");
    setLimit("all");
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-surface p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Filters
          </p>
          <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
            Clear
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Map</Label>
            <Select value={map} onValueChange={setMap}>
              <SelectTrigger className="w-full bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All maps</SelectItem>
                {VALORANT_MAPS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="SCRIM">Scrim</SelectItem>
                <SelectItem value="PREMIER">Premier</SelectItem>
                <SelectItem value="TOURNAMENT">Tournament</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Result</Label>
            <Select value={outcome} onValueChange={setOutcome}>
              <SelectTrigger className="w-full bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All results</SelectItem>
                <SelectItem value="WIN">Win</SelectItem>
                <SelectItem value="LOSS">Loss</SelectItem>
                <SelectItem value="DRAW">Draw</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Opponent</Label>
            <Input
              value={opponentName}
              onChange={(e) => setOpponentName(e.target.value)}
              placeholder="e.g. KRÜ"
              className="bg-background"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Enemy agents</Label>
            <Input
              value={agentsText}
              onChange={(e) => setAgentsText(e.target.value)}
              placeholder="Jett, Sova"
              className="bg-background"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Limit</Label>
            <Select value={limit} onValueChange={setLimit}>
              <SelectTrigger className="w-full bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="10">Last 10</SelectItem>
                <SelectItem value="20">Last 20</SelectItem>
                <SelectItem value="50">Last 50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {scrims.length === 0 ? (
        <EmptyState
          title="No scrims match"
          description="Try clearing filters or upload a new scoreboard."
          actionLabel="Upload scrim"
          onAction={() => navigate("/app/scrims/new")}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Map</th>
                <th className="px-4 py-3 font-medium">Opponent</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Result</th>
                <th className="px-4 py-3 font-medium text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {scrims.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-border/70 last:border-0 hover:bg-muted/40 cursor-pointer transition-colors"
                  onClick={() => navigate(`/app/scrims/${s.id}`)}
                >
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(s.createdAt)}</td>
                  <td className="px-4 py-3 font-medium whitespace-nowrap">{s.map}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {s.opponentName || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{s.type}</td>
                  <td className="px-4 py-3">
                    <OutcomePill outcome={s.outcome} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium">
                    {s.teamRounds}–{s.enemyRounds}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
