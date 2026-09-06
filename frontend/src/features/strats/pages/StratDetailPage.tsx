import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { stratsApi } from "@/shared/api/strats.api";
import { env } from "@/shared/config/env";
import { PageHeader } from "@/shared/ui/PageHeader";
import { ScreenshotPreview } from "@/shared/ui/ScreenshotPreview";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/shared/ui/feedback/LoadingState";
import { ErrorState } from "@/shared/ui/feedback/ErrorState";

export default function StratDetailPage() {
  const { stratId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const teamId = user?.teamMember?.teamId;

  const query = useQuery({
    queryKey: ["strat", teamId, stratId],
    queryFn: () => stratsApi.getOne(teamId!, stratId!),
    enabled: Boolean(teamId && stratId),
  });

  if (query.isLoading) return <LoadingState title="Loading strat" />;
  if (query.isError || !query.data) {
    return (
      <ErrorState
        title="Strat not found"
        actionLabel="Back"
        onAction={() => navigate("/app/strats")}
      />
    );
  }

  const s = query.data;
  const screenshotSrc = s.screenshotUrl ? `${env.assetsUrl}${s.screenshotUrl}` : null;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={`${s.map}${s.side ? ` · ${s.side}` : ""}`}
        title={s.name}
        description={s.createdAt ? new Date(s.createdAt).toLocaleString() : undefined}
        actions={
          <Button variant="outline" onClick={() => navigate("/app/strats")}>
            Back
          </Button>
        }
      />

      <div className="space-y-2">
        <ScreenshotPreview
          src={screenshotSrc}
          alt={s.name}
          emptyLabel="No screenshot"
          lightboxTitle={s.name}
          maxHeightClassName="max-h-[min(52vh,520px)]"
        />
        {screenshotSrc ? (
          <p className="px-0.5 text-xs text-muted-foreground">
            Click the screenshot to expand.
          </p>
        ) : null}
      </div>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Notes</p>
        <p className="mt-3 text-sm leading-relaxed text-pretty whitespace-pre-wrap">
          {s.notes?.trim() || "No notes for this strat."}
        </p>
      </section>
    </div>
  );
}
