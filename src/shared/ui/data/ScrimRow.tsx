import { Link } from "react-router-dom";
import type { ScrimDto, ScrimOutcome } from "@/shared/types/dto";
import { formatRelative, outcomeLabel, scrimTypeLabel } from "@/shared/lib/format";
import { MapImage } from "@/shared/ui/valorant/MapImage";
import { cn } from "@/lib/utils";

const railColor: Record<ScrimOutcome, string> = {
  WIN: "var(--win)",
  LOSS: "var(--loss)",
  DRAW: "var(--draw)",
};
const text: Record<ScrimOutcome, string> = {
  WIN: "text-win",
  LOSS: "text-loss",
  DRAW: "text-draw",
};

/** Fila del historial: resultado, marcador, mapa, rival y fecha. */
export function ScrimRow({ scrim, className }: { scrim: ScrimDto; className?: string }) {
  const { id, map, type, outcome, teamRounds, enemyRounds, opponentName, createdAt } = scrim;
  return (
    <Link
      to={`/app/scrims/${id}`}
      style={{ ["--rail-color" as string]: railColor[outcome] }}
      className={cn(
        "panel rail group flex items-center gap-3 py-2.5 pr-3 pl-4 transition-colors outline-none hover:bg-accent/40 focus-visible:ring-3 focus-visible:ring-ring/60 sm:gap-4 sm:pr-4 sm:pl-5",
        className
      )}
    >
      <div className="w-[74px] shrink-0">
        <p className={cn("text-[10px] font-semibold tracking-[0.14em] uppercase", text[outcome])}>
          {outcomeLabel(outcome)}
        </p>
        <p className="num mt-0.5 text-xl">
          {teamRounds}-{enemyRounds}
        </p>
      </div>

      <span className="hidden h-9 w-px bg-border/70 sm:block" aria-hidden="true" />
      <MapImage map={map} variant="strip" className="hidden h-10 w-[86px] shrink-0 rounded sm:block" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          vs <span className="text-foreground">{opponentName}</span>
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {map} · {scrimTypeLabel(type)}
        </p>
      </div>

      <span className="shrink-0 text-xs text-muted-foreground">{formatRelative(createdAt)}</span>
    </Link>
  );
}

export default ScrimRow;
