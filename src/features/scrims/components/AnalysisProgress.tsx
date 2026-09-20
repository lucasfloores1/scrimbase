import { useEffect, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Progreso del análisis con IA.
 *
 * El backend no informa avance real, así que esto es una ESTIMACIÓN: avanza
 * por etapas con tiempos típicos y se frena en 95 % hasta que llega la
 * respuesta. Nunca muestra 100 % antes de tiempo ni se queda clavado: si la
 * llamada tarda más de lo previsto, sigue reptando de a poco y avisa.
 * Al terminar, salta a 100 %.
 */

const STAGES = [
  { label: "Subiendo la captura", ms: 1200 },
  { label: "Leyendo el scoreboard", ms: 3500 },
  { label: "Identificando agentes", ms: 3000 },
  { label: "Cruzando jugadores con el roster", ms: 2000 },
];

const TOTAL = STAGES.reduce((a, s) => a + s.ms, 0);
const CEILING = 95;

export function AnalysisProgress({ done, className }: { done?: boolean; className?: string }) {
  const [elapsed, setElapsed] = useState(0);
  const start = useRef<number | null>(null);

  // El reloj arranca en el efecto, no en el render: leer performance.now()
  // durante el render es impuro y da tiempos distintos en cada re-render.
  useEffect(() => {
    if (done) return;
    start.current = performance.now();
    const id = window.setInterval(() => {
      if (start.current !== null) setElapsed(performance.now() - start.current);
    }, 100);
    return () => window.clearInterval(id);
  }, [done]);

  // Hasta TOTAL avanza proporcional; después se arrastra asintóticamente al techo.
  const raw = elapsed <= TOTAL ? (elapsed / TOTAL) * CEILING : CEILING - 8 * Math.exp(-(elapsed - TOTAL) / 9000);
  const pct = done ? 100 : Math.min(CEILING, raw);

  // Índice de la etapa en curso: la primera cuyo tiempo acumulado supera lo transcurrido.
  const cumulative = STAGES.reduce<number[]>((acc, s) => [...acc, (acc.at(-1) ?? 0) + s.ms], []);
  const stageIndex = cumulative.findIndex((end) => elapsed < end);
  const current = done ? STAGES.length : stageIndex === -1 ? STAGES.length - 1 : stageIndex;
  const slow = !done && elapsed > TOTAL + 6000;

  return (
    <div className={cn("surface p-5", className)} role="status" aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{done ? "Análisis listo" : "Analizando la captura…"}</p>
        <span className="num text-sm text-muted-foreground tabular-nums">{Math.round(pct)}%</span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="bg-plasma h-full rounded-full transition-[width] duration-200 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="mt-4 space-y-2">
        {STAGES.map((s, i) => {
          const state = i < current ? "done" : i === current ? "active" : "pending";
          return (
            <li
              key={s.label}
              className={cn(
                "flex items-center gap-2.5 text-sm transition-colors",
                state === "done" && "text-muted-foreground",
                state === "active" && "text-foreground",
                state === "pending" && "text-muted-foreground/45"
              )}
            >
              {state === "done" ? (
                <Check className="size-4 shrink-0 text-win" />
              ) : state === "active" ? (
                <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
              ) : (
                <span className="size-4 shrink-0" />
              )}
              {s.label}
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-xs text-muted-foreground">
        {slow
          ? "Está tardando más de lo normal. No cierres la pestaña, seguimos esperando la respuesta."
          : "El tiempo es estimado: depende de cuánto tarde el modelo en responder."}
      </p>
    </div>
  );
}

export default AnalysisProgress;
