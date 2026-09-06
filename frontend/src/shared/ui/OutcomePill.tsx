import { cn } from "@/lib/utils";
import type { ScrimOutcome } from "@/shared/types/dto";

const styles: Record<ScrimOutcome, string> = {
  WIN: "bg-win/10 text-win border-win/20",
  LOSS: "bg-loss/10 text-loss border-loss/20",
  DRAW: "bg-muted text-muted-foreground border-border",
};

const labels: Record<ScrimOutcome, string> = {
  WIN: "Victoria",
  LOSS: "Derrota",
  DRAW: "Empate",
};

export function OutcomePill({
  outcome,
  className,
}: {
  outcome: ScrimOutcome;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        styles[outcome],
        className,
      )}
    >
      {labels[outcome]}
    </span>
  );
}
