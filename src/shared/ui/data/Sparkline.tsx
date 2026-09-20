import { cn } from "@/lib/utils";

/** Línea de tendencia en SVG puro, con la base en cero marcada. */
export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  if (values.length < 2) return null;
  const w = 100;
  const h = 34;
  const pad = 3;
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const span = max - min || 1;
  const x = (i: number) => pad + (i / (values.length - 1)) * (w - pad * 2);
  const y = (v: number) => pad + (1 - (v - min) / span) * (h - pad * 2);
  const d = values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const last = values[values.length - 1];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true" className={cn("h-9 w-full overflow-visible", className)}>
      <line
        x1={0}
        x2={w}
        y1={y(0)}
        y2={y(0)}
        stroke="currentColor"
        strokeOpacity={0.25}
        strokeDasharray="2 3"
        vectorEffect="non-scaling-stroke"
        className="text-muted-foreground"
      />
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className="text-amber"
      />
      <circle cx={x(values.length - 1)} cy={y(last)} r={2.5} fill="currentColor" className={last >= 0 ? "text-win" : "text-loss"} />
    </svg>
  );
}

export default Sparkline;
