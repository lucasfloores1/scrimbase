import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Check, Loader2, Sparkles } from "lucide-react";

import { billingApi } from "@/shared/api/billing.api";
import { useAuth } from "@/app/providers/AuthProvider";
import { useTeamId } from "@/shared/hooks/useTeam";
import { errorMessage } from "@/shared/lib/format";
import { timeUntil } from "@/shared/lib/quota";
import type { QuotaDto } from "@/shared/types/dto";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FormMessage } from "@/shared/ui/feedback/FormMessage";
import { cn } from "@/lib/utils";

const PRO_FEATURES = [
  "Scrims ilimitadas por mes",
  "Análisis con IA sin tope diario",
  "Historial completo con todos los filtros",
  "Estadísticas por jugador del roster",
];

export function UpgradeDialog({
  open,
  onOpenChange,
  quota,
  reason,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quota?: QuotaDto;
  /** Por qué se abrió: cambia el encabezado. */
  reason?: "quota" | "manual";
}) {
  const teamId = useTeamId();
  const { user } = useAuth();
  const isAdmin = !!user?.teamMember?.isAdmin;
  const [failed, setFailed] = useState<string | null>(null);

  const checkout = useMutation({
    mutationFn: () => billingApi.checkout(teamId!, "PRO"),
    onSuccess: (res) => {
      if (res?.url) window.location.href = res.url;
      else setFailed("El servidor no devolvió un link de pago.");
    },
    onError: (e) => setFailed(errorMessage(e, "No se pudo iniciar el pago. Probá de nuevo en un rato.")),
  });

  const resets = timeUntil(quota?.resetsAt);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl">
            {reason === "quota" ? "Llegaste al límite del plan gratis" : "Pasar a Scrimbase Pro"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {reason === "quota"
              ? `El plan gratis permite ${quota?.limit ?? 1} scrim por día${resets ? `; el cupo se renueva ${resets}` : ""}. Con Pro subís todas las que quieras.`
              : "Sacá el tope diario y registrá todas las scrims del equipo."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="surface p-5">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-lg font-semibold">Pro</span>
            <span className="text-xs text-muted-foreground">por equipo</span>
          </div>
          <ul className="mt-4 space-y-2.5">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-win" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {failed ? <FormMessage kind="error">{failed}</FormMessage> : null}

        {!isAdmin ? (
          <p className="text-sm text-muted-foreground">
            El plan es del equipo y lo contrata un admin. Pedile a quien administra el equipo que lo active.
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={checkout.isPending}>
            {isAdmin ? "Ahora no" : "Entendido"}
          </Button>
          <Button
            className={cn("bg-plasma border-0 text-white hover:opacity-90", !isAdmin && "hidden")}
            disabled={checkout.isPending || !teamId}
            onClick={() => {
              setFailed(null);
              checkout.mutate();
            }}
          >
            {checkout.isPending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Sparkles data-icon="inline-start" />}
            {checkout.isPending ? "Abriendo el pago…" : "Pasar a Pro"}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          El pago lo procesa el proveedor; Scrimbase no guarda datos de tu tarjeta.
        </p>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default UpgradeDialog;
