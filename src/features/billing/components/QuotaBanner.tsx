import { Infinity as InfinityIcon, Lock, Zap } from "lucide-react";
import type { SubscriptionDto } from "@/shared/types/dto";
import { quotaSummary, timeUntil } from "@/shared/lib/quota";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Estado del cupo arriba de la carga de scrims. Tres situaciones:
 * ilimitado (Pro), con cupo disponible, y agotado (bloquea y ofrece pagar).
 */
export function QuotaBanner({
  subscription,
  onUpgrade,
  className,
}: {
  subscription: SubscriptionDto;
  onUpgrade: () => void;
  className?: string;
}) {
  const { plan, quota } = subscription;
  const unlimited = quota.limit === null;
  const exhausted = !unlimited && (quota.remaining ?? 0) <= 0;
  const resets = timeUntil(quota.resetsAt);

  if (unlimited) {
    return (
      <div className={cn("surface flex items-center gap-2.5 px-4 py-2.5 text-sm", className)}>
        <InfinityIcon className="size-4 shrink-0 text-win" />
        <span className="text-muted-foreground">
          Plan <span className="text-foreground">{plan === "PRO" ? "Pro" : plan}</span> · scrims ilimitadas
        </span>
      </div>
    );
  }

  if (exhausted) {
    return (
      <div className={cn("surface border-primary/30 p-5", className)}>
        <div className="flex items-start gap-3">
          <span className="bg-plasma flex size-9 shrink-0 items-center justify-center rounded-md text-white">
            <Lock className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium">Usaste tu scrim gratis {quota.period === "DAY" ? "de hoy" : "del mes"}.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {resets ? `Tu cupo se renueva ${resets}. ` : ""}
              Si querés subir más ahora, pasá a Pro y registrá todas las que quieras.
            </p>
            <Button className="bg-plasma mt-4 border-0 text-white hover:opacity-90" onClick={onUpgrade}>
              <Zap data-icon="inline-start" />
              Pasar a Pro
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const pct = quota.limit ? Math.min(100, (quota.used / quota.limit) * 100) : 0;

  return (
    <div className={cn("surface flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-sm", className)}>
      <span className="text-muted-foreground">
        <span className="text-foreground">{quotaSummary(quota)}</span>
        {resets ? ` · se renueva ${resets}` : ""}
      </span>
      <span className="h-1 min-w-24 flex-1 overflow-hidden rounded-full bg-muted">
        <span className="bg-plasma block h-full rounded-full" style={{ width: `${pct}%` }} />
      </span>
      <Button variant="ghost" size="xs" onClick={onUpgrade}>
        Subir sin límite
      </Button>
    </div>
  );
}

export default QuotaBanner;
