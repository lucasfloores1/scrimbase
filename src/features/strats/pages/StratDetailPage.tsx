import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { env } from "@/shared/config/env";
import { stratsApi } from "@/shared/api/strats.api";
import { useTeamId, useTeamMembers } from "@/shared/hooks/useTeam";
import { errorMessage, formatDate, sideLabel } from "@/shared/lib/format";

import { Button } from "@/components/ui/button";
import { MapImage } from "@/shared/ui/valorant/MapImage";
import { Lightbox } from "@/shared/ui/valorant/Lightbox";
import { LoadingState } from "@/shared/ui/feedback/LoadingState";
import { ErrorState } from "@/shared/ui/feedback/ErrorState";
import { cn } from "@/lib/utils";

export default function StratDetailPage() {
  const navigate = useNavigate();
  const { stratId } = useParams();
  const teamId = useTeamId();
  const members = useTeamMembers();

  const query = useQuery({
    queryKey: ["strat", teamId, stratId],
    queryFn: () => stratsApi.getOne(teamId!, stratId!),
    enabled: !!teamId && !!stratId,
  });

  const back = (
    <Button asChild variant="ghost" size="sm" className="-ml-2">
      <Link to="/app/strats">
        <ArrowLeft data-icon="inline-start" />
        Strats
      </Link>
    </Button>
  );

  if (query.isLoading) {
    return (
      <div className="space-y-6">
        {back}
        <LoadingState variant="page" rows={3} />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="space-y-6">
        {back}
        <ErrorState
          title="No se pudo cargar la strat"
          description={errorMessage(query.error)}
          actionLabel="Volver al listado"
          onAction={() => navigate("/app/strats")}
        />
      </div>
    );
  }

  const s = query.data;
  const author = members.data?.find((m) => m.user.id === s.createdBy)?.user.username;

  return (
    <div className="space-y-6">
      {back}

      <header className="flex flex-wrap items-center gap-4">
        <MapImage map={s.map} variant="minimap" className="size-16 shrink-0" imgClassName="object-contain" eager />
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span
              className={cn(
                "inline-flex h-6 items-center rounded border px-2 font-medium",
                s.side === "ATTACK" ? "border-loss/50 bg-loss/10 text-loss" : "border-chart-4/50 bg-chart-4/10 text-chart-4"
              )}
            >
              {sideLabel(s.side)}
            </span>
            <span className="eyebrow text-primary">{s.map}</span>
            <span>· {formatDate(s.createdAt)}</span>
            {author ? <span>· por {author}</span> : null}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{s.name}</h1>
        </div>
      </header>

      {s.screenshotUrl ? (
        <Lightbox src={env.assetsUrl + s.screenshotUrl} alt={`Setup de ${s.name} en ${s.map}`} />
      ) : null}

      <section className="space-y-3">
        <h2 className="eyebrow">Notas</h2>
        {s.notes ? (
          <p className="max-w-prose text-[15px] leading-relaxed whitespace-pre-line">{s.notes}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Esta strat no tiene notas.</p>
        )}
      </section>
    </div>
  );
}
