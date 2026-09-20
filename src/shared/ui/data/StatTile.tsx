import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Bloque de dato del equipo: etiqueta, cifra grande y apoyo abajo. */
export function StatTile({
  label,
  value,
  hint,
  tone = "default",
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "amber" | "win" | "loss";
  className?: string;
}) {
  return (
    <div className={cn("surface p-5", className)}>
      <p className="eyebrow">{label}</p>
      <div
        className={cn(
          "num mt-3 text-[2.5rem]",
          tone === "amber" && "text-amber",
          tone === "win" && "text-win",
          tone === "loss" && "text-loss"
        )}
      >
        {value}
      </div>
      {hint ? <div className="mt-3 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

export default StatTile;
