import type { ScrimOutcome } from "@/shared/types/dto";
import { outcomeLabel, outcomeShort } from "@/shared/lib/format";
import { cn } from "@/lib/utils";

const tone: Record<ScrimOutcome, string> = {
  WIN: "bg-win/12 text-win border-win/40",
  LOSS: "bg-loss/12 text-loss border-loss/40",
  DRAW: "bg-draw/12 text-draw border-draw/40",
};

export function OutcomeBadge({
  outcome,
  size = "full",
  className,
}: {
  outcome: ScrimOutcome;
  size?: "short" | "full";
  className?: string;
}) {
  return (
    <span
      title={outcomeLabel(outcome)}
      className={cn(
        "inline-flex items-center justify-center rounded border font-display font-semibold tracking-wide uppercase",
        size === "short" ? "size-6 text-sm" : "h-6 px-2 text-xs",
        tone[outcome],
        className
      )}
    >
      {size === "short" ? outcomeShort(outcome) : outcomeLabel(outcome)}
    </span>
  );
}

export default OutcomeBadge;
