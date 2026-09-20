import { cn } from "@/lib/utils";

/** Anillo de porcentaje en SVG puro. */
export function Donut({
  value,
  size = 64,
  stroke = 6,
  className,
  tone = "amber",
}: {
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
  tone?: "amber" | "win";
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("shrink-0 -rotate-90", className)}
      aria-hidden="true"
    >
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-muted" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeDasharray={`${(pct / 100) * c} ${c}`}
        className={tone === "amber" ? "text-amber" : "text-win"}
      />
    </svg>
  );
}

export default Donut;
