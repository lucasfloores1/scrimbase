import { Check, Lock } from "lucide-react";
import type { CreateScrimDto, ScrimPlayerStatDto } from "@/shared/types/dto";
import type { TeamMemberListItem } from "@/shared/types/models";
import { SCRIM_TYPES } from "@/shared/constants/valorant";
import { outcomeFromRounds } from "@/shared/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AgentSelect } from "@/shared/ui/valorant/AgentSelect";
import { MapImage } from "@/shared/ui/valorant/MapImage";
import { Lightbox } from "@/shared/ui/valorant/Lightbox";
import { OutcomeBadge } from "@/shared/ui/data/OutcomeBadge";
import { Score } from "@/shared/ui/data/Score";
import { FormMessage } from "@/shared/ui/feedback/FormMessage";
import { cn } from "@/lib/utils";

const UNASSIGNED = "__none__";

type Props = {
  draft: CreateScrimDto;
  warnings?: string[];
  previewUrl: string | null;
  members: TeamMemberListItem[];
  onPatchPlayer: (index: number, patch: Partial<ScrimPlayerStatDto>) => void;
  onPatchEnemy: (index: number, agent: string) => void;
  onOpponentName: (value: string) => void;
  onSave: () => void;
  saving: boolean;
  errorText?: string;
};

/**
 * Paso 2. Los números que leyó la IA se muestran pero NO se editan: la scrim queda
 * como la registró el análisis. Lo único que se completa a mano es lo que la IA no
 * puede saber (el rival) o no pudo reconocer (agente y jugador).
 */
export function ReviewStep({
  draft,
  warnings,
  previewUrl,
  members,
  onPatchPlayer,
  onPatchEnemy,
  onOpponentName,
  onSave,
  saving,
  errorText,
}: Props) {
  const outcome = outcomeFromRounds(draft.teamRounds, draft.enemyRounds);
  const missingAgents =
    draft.teamStats.filter((p) => !p.agent || p.agent === "UNKNOWN").length +
    draft.enemyComposition.filter((a) => !a || a === "UNKNOWN").length;
  const missingPlayers = draft.teamStats.filter((p) => !p.displayName?.trim() && !p.userId).length;
  const canSave = draft.opponentName.trim().length > 0 && missingAgents === 0 && missingPlayers === 0 && !saving;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {/* Resumen de la partida */}
        <section className="surface relative overflow-hidden">
          <MapImage map={draft.map} variant="splash" className="absolute inset-0 opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-1 via-surface-1/88 to-surface-1/45" aria-hidden="true" />
          <div className="relative flex flex-col gap-4 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow">
                {draft.map} · {SCRIM_TYPES.find((t) => t.value === draft.type)?.label}
              </p>
              <OutcomeBadge outcome={outcome} />
            </div>
            <Score team={draft.teamRounds} enemy={draft.enemyRounds} size="lg" />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="size-3" />
              Marcador y estadísticas los fija el análisis; no se editan.
            </div>
          </div>
        </section>

        {previewUrl ? (
          <Lightbox src={previewUrl} alt="Captura del scoreboard" className="h-full">
            <img src={previewUrl} alt="Captura del scoreboard" className="h-full max-h-64 w-full object-cover object-top" />
          </Lightbox>
        ) : null}
      </div>

      {warnings?.length ? (
        <FormMessage kind="warning">
          <span className="font-medium">La IA no pudo reconocer todo. Completá lo que falta abajo:</span>
          <ul className="mt-1 list-disc pl-4 text-muted-foreground">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </FormMessage>
      ) : null}

      {/* Rival */}
      <section className="space-y-2">
        <Label htmlFor="opponentName">Rival</Label>
        <Input
          id="opponentName"
          value={draft.opponentName}
          onChange={(e) => onOpponentName(e.target.value)}
          placeholder="Nombre del equipo rival"
          maxLength={60}
          className="max-w-sm"
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          Con esto después podés filtrar todas las partidas contra ese equipo.
        </p>
      </section>

      {/* Nuestro equipo */}
      <section className="space-y-3">
        <h2 className="eyebrow">Nuestro equipo</h2>
        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 text-xs tracking-wider text-muted-foreground uppercase">
                  <th className="px-3 py-2.5 text-left font-medium">Jugador</th>
                  <th className="px-3 py-2.5 text-left font-medium">Agente</th>
                  <th className="px-2 py-2.5 text-right font-medium">K</th>
                  <th className="px-2 py-2.5 text-right font-medium">D</th>
                  <th className="px-2 py-2.5 text-right font-medium">A</th>
                  <th className="px-3 py-2.5 text-right font-medium">ACS</th>
                </tr>
              </thead>
              <tbody>
                {draft.teamStats.map((p, idx) => {
                  const matched = !!p.userId;
                  return (
                    <tr key={idx} className="border-b border-border/50 last:border-0">
                      <td className="px-3 py-2 align-middle">
                        {matched ? (
                          <span className="inline-flex items-center gap-2">
                            <Check className="size-4 shrink-0 text-win" aria-label="Reconocido por Riot ID" />
                            <span className="font-medium">{p.displayName}</span>
                          </span>
                        ) : (
                          <Select
                            value={p.userId ?? UNASSIGNED}
                            onValueChange={(v) => {
                              if (v === UNASSIGNED) return onPatchPlayer(idx, { userId: undefined });
                              const m = members.find((x) => x.user.id === v);
                              onPatchPlayer(idx, { userId: v, displayName: m?.user.username });
                            }}
                          >
                            <SelectTrigger size="sm" className="min-w-44" aria-label={`Jugador ${idx + 1}`}>
                              <SelectValue placeholder={p.displayName?.trim() ? p.displayName : "Elegir jugador"} />
                            </SelectTrigger>
                            <SelectContent>
                              {members.map((m) => (
                                <SelectItem key={m.user.id} value={m.user.id}>
                                  {m.user.username}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <AgentSelect
                          value={p.agent}
                          onChange={(agent) => onPatchPlayer(idx, { agent })}
                          ariaLabel={`Agente del jugador ${idx + 1}`}
                          className={cn("min-w-40", (!p.agent || p.agent === "UNKNOWN") && "border-amber/50")}
                        />
                      </td>
                      <td className="num px-2 py-2 text-right text-base">{p.kills}</td>
                      <td className="num px-2 py-2 text-right text-base">{p.deaths}</td>
                      <td className="num px-2 py-2 text-right text-base">{p.assists}</td>
                      <td className="num px-3 py-2 text-right text-base text-amber">{p.acs}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Composición rival */}
      <section className="space-y-3">
        <h2 className="eyebrow">Composición rival</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {draft.enemyComposition.map((a, idx) => (
            <AgentSelect
              key={idx}
              value={a}
              onChange={(agent) => onPatchEnemy(idx, agent)}
              ariaLabel={`Agente rival ${idx + 1}`}
              placeholder={`Agente ${idx + 1}`}
              className={cn((!a || a === "UNKNOWN") && "border-amber/50")}
            />
          ))}
        </div>
      </section>

      {errorText ? <FormMessage kind="error">{errorText}</FormMessage> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {canSave
            ? "Todo listo para guardar."
            : `Falta completar: ${[
                draft.opponentName.trim() ? null : "rival",
                missingAgents ? `${missingAgents} ${missingAgents === 1 ? "agente" : "agentes"}` : null,
                missingPlayers ? `${missingPlayers} ${missingPlayers === 1 ? "jugador" : "jugadores"}` : null,
              ]
                .filter(Boolean)
                .join(", ")}.`}
        </p>
        <Button size="lg" disabled={!canSave} onClick={onSave}>
          {saving ? "Guardando…" : "Guardar scrim"}
        </Button>
      </div>
    </div>
  );
}

export default ReviewStep;
