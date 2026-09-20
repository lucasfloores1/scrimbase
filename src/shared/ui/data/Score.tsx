import { cn } from "@/lib/utils";

const sizes = { sm: "text-xl", md: "text-3xl", lg: "text-5xl md:text-6xl" };

/** Marcador propio–rival: el número propio se colorea, el rival queda apagado. */
export function Score({
  team,
  enemy,
  size = "md",
  className,
}: {
  team: number;
  enemy: number;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const won = team > enemy;
  const lost = team < enemy;
  return (
    <span className={cn("num inline-flex items-baseline gap-1.5", sizes[size], className)}>
      <span className={cn(won && "text-win", lost && "text-loss")}>{team}</span>
      <span className="text-muted-foreground/50">:</span>
      <span className="text-muted-foreground">{enemy}</span>
    </span>
  );
}

export default Score;
