import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { scrimsApi } from "@/shared/api/scrims.api";
import { env } from "@/shared/config/env";
import { PageHeader } from "@/shared/ui/PageHeader";
import { OutcomePill } from "@/shared/ui/OutcomePill";
import { ScreenshotPreview } from "@/shared/ui/ScreenshotPreview";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/shared/ui/feedback/LoadingState";
import { ErrorState } from "@/shared/ui/feedback/ErrorState";

export default function ScrimDetailPage() {
  const { scrimId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const teamId = user?.teamMember?.teamId;

  const query = useQuery({
    queryKey: ["scrim", teamId, scrimId],
    queryFn: () => scrimsApi.getOne(teamId!, scrimId!),
    enabled: Boolean(teamId && scrimId),
  });

  if (query.isLoading) return <LoadingState title="Loading scrim" />;
  if (query.isError || !query.data) {
    return (
      <ErrorState
        title="Scrim not found"
        description={query.error instanceof Error ? query.error.message : undefined}
        actionLabel="Back to scrims"
        onAction={() => navigate("/app/scrims")}
      />
    );
  }

  const s = query.data;
  const screenshotSrc = s.screenshotUrl ? `${env.assetsUrl}${s.screenshotUrl}` : null;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Scrim detail"
        title={`${s.map} vs ${s.opponentName || "Unknown"} · ${s.teamRounds}–${s.enemyRounds}`}
        description={`${s.type} · ${new Date(s.createdAt ?? "").toLocaleString()}`}
        actions={
          <div className="flex items-center gap-2">
            <OutcomePill outcome={s.outcome} />
            <Button variant="outline" onClick={() => navigate("/app/scrims")}>
              Back
            </Button>
          </div>
        }
      />

      <div className="space-y-2">
        <ScreenshotPreview
          src={screenshotSrc}
          alt="Scoreboard"
          emptyLabel="No screenshot"
          lightboxTitle="Scoreboard"
          maxHeightClassName="max-h-[min(52vh,520px)]"
        />
        {screenshotSrc ? (
          <p className="px-0.5 text-xs text-muted-foreground">
            Click the screenshot to expand.
          </p>
        ) : null}
      </div>

      <div className="space-y-4">
        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                <th className="px-4 py-3 font-medium">Player</th>
                <th className="px-4 py-3 font-medium">Agent</th>
                <th className="px-4 py-3 font-medium text-right">K</th>
                <th className="px-4 py-3 font-medium text-right">D</th>
                <th className="px-4 py-3 font-medium text-right">A</th>
                <th className="px-4 py-3 font-medium text-right">ACS</th>
              </tr>
            </thead>
            <tbody>
              {s.teamStats.map((p, i) => (
                <tr
                  key={i}
                  className={
                    p.userId
                      ? "border-b border-border/70 last:border-0 hover:bg-muted/40 cursor-pointer transition-colors"
                      : "border-b border-border/70 last:border-0"
                  }
                  onClick={() => {
                    if (p.userId) navigate(`/app/team/${p.userId}`);
                  }}
                >
                  <td className="px-4 py-3 font-medium">
                    {p.userId ? (
                      <span className="underline-offset-4 hover:underline">{p.displayName ?? "—"}</span>
                    ) : (
                      (p.displayName ?? "—")
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.agent}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{p.kills}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{p.deaths}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{p.assists}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium">{p.acs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Enemy</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {s.enemyComposition.map((agent, i) => (
              <span
                key={i}
                className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium"
              >
                {agent}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
