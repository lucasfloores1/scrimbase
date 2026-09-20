import { cn } from "@/lib/utils";

/** Barra apilada victorias / empates / derrotas. */
export function RecordBar({
  wins,
  losses,
  draws = 0,
  className,
}: {
  wins: number;
  losses: number;
  draws?: number;
  className?: string;
}) {
  const total = wins + losses + draws;
  if (total === 0) return <div className={cn("h-1 bg-muted", className)} />;
  const pct = (n: number) => `${(n / total) * 100}%`;
  return (
    <div
      className={cn("flex h-1 w-full overflow-hidden bg-muted", className)}
      role="img"
      aria-label={`${wins} victorias, ${draws} empates, ${losses} derrotas`}
    >
      <span className="bg-win" style={{ width: pct(wins) }} />
      <span className="bg-draw/60" style={{ width: pct(draws) }} />
      <span className="bg-loss" style={{ width: pct(losses) }} />
    </div>
  );
}

export default RecordBar;
