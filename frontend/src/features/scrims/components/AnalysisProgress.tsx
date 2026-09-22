import * as React from "react";
import { Check, Loader2 } from "lucide-react";

import { useI18n } from "@/app/providers/I18nProvider";
import type { TranslationKey } from "@/shared/i18n/locales";
import { cn } from "@/lib/utils";

/**
 * Barra de progreso estimada: el backend no reporta avance real del modelo,
 * así que avanzamos por etapas hacia un techo del 95% y recién cerramos en 100
 * cuando la request termina.
 */
const STAGES: Array<{ key: TranslationKey; until: number }> = [
  { key: "analysis.upload", until: 18 },
  { key: "analysis.read", until: 40 },
  { key: "analysis.agents", until: 60 },
  { key: "analysis.stats", until: 78 },
  { key: "analysis.roster", until: 90 },
  { key: "analysis.finishing", until: 95 },
];

const CEILING = 95;
const TICK_MS = 140;

export function AnalysisProgress({ active, done }: { active: boolean; done: boolean }) {
  const { t } = useI18n();
  const [progress, setProgress] = React.useState(0);
  const [elapsed, setElapsed] = React.useState(0);

  React.useEffect(() => {
    if (!active) {
      setProgress(0);
      setElapsed(0);
      return;
    }

    const startedAt = Date.now();

    const tick = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
      setProgress((prev) => {
        if (prev >= CEILING) return CEILING;
        // Arranca rápido y se va frenando a medida que se acerca al techo
        const step = Math.max(0.35, (CEILING - prev) * 0.045);
        return Math.min(CEILING, prev + step);
      });
    }, TICK_MS);

    return () => window.clearInterval(tick);
  }, [active]);

  React.useEffect(() => {
    if (done) setProgress(100);
  }, [done]);

  if (!active && !done) return null;

  const currentIndex = STAGES.findIndex((stage) => progress < stage.until);
  const activeIndex = done ? STAGES.length : currentIndex === -1 ? STAGES.length - 1 : currentIndex;

  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          {done ? (
            <Check className="h-4 w-4 text-success" />
          ) : (
            <Loader2 className="h-4 w-4 animate-spin text-brand" />
          )}
          {t("analysis.title")}
        </div>
        <div className="text-xs tabular-nums text-muted-foreground">
          {Math.round(progress)}% · {t("analysis.elapsed", { seconds: elapsed })}
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ul className="space-y-1.5">
        {STAGES.map((stage, idx) => {
          const isDone = idx < activeIndex;
          const isCurrent = idx === activeIndex && !done;

          return (
            <li
              key={stage.key}
              className={cn(
                "flex items-center gap-2 text-xs transition-colors",
                isDone ? "text-muted-foreground" : isCurrent ? "text-foreground" : "text-muted-foreground/50"
              )}
            >
              {isDone ? (
                <Check className="h-3.5 w-3.5 text-success" />
              ) : isCurrent ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" />
              ) : (
                <span className="h-3.5 w-3.5 rounded-full border border-current opacity-40" />
              )}
              {t(stage.key)}
            </li>
          );
        })}
      </ul>

      {elapsed > 25 && !done ? (
        <p className="text-xs text-muted-foreground">{t("analysis.slow")}</p>
      ) : null}
    </div>
  );
}

export default AnalysisProgress;
