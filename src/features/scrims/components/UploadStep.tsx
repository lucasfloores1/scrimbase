import { Link } from "react-router-dom";
import { Sparkles, Users } from "lucide-react";
import { SCRIM_TYPES, VALORANT_MAPS } from "@/shared/constants/valorant";
import type { ScrimType } from "@/shared/types/dto";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilePicker } from "@/shared/ui/forms/FilePicker";
import { SegmentedControl } from "@/shared/ui/forms/SegmentedControl";
import { FormMessage } from "@/shared/ui/feedback/FormMessage";
import { MapImage } from "@/shared/ui/valorant/MapImage";
import { AnalysisProgress } from "@/features/scrims/components/AnalysisProgress";

type Props = {
  type: ScrimType;
  onType: (t: ScrimType) => void;
  map: string;
  onMap: (m: string) => void;
  file: File | null;
  onFile: (f: File | null) => void;
  previewUrl: string | null;
  onAnalyze: () => void;
  analyzing: boolean;
  error?: unknown;
  errorText?: string;
  teamTooSmall: boolean;
  memberCount: number | null;
  minMembers: number;
  /** Cupo agotado: no se puede analizar hasta pagar o esperar la renovación. */
  quotaBlocked?: boolean;
  /** Banner de plan/cupo, renderizado por la página. */
  quotaSlot?: React.ReactNode;
};

export function UploadStep({
  type,
  onType,
  map,
  onMap,
  file,
  onFile,
  previewUrl,
  onAnalyze,
  analyzing,
  errorText,
  teamTooSmall,
  memberCount,
  minMembers,
  quotaBlocked = false,
  quotaSlot,
}: Props) {
  const blocked = teamTooSmall || quotaBlocked;
  return (
    <div className="space-y-6">
      {quotaSlot}

      {teamTooSmall ? (
        <div className="surface flex items-start gap-3 border-amber/40 bg-amber/5 p-4 text-sm">
          <Users className="mt-0.5 size-5 shrink-0 text-amber" />
          <div className="space-y-1">
            <p className="font-medium">El equipo necesita {minMembers} miembros para registrar scrims.</p>
            <p className="text-muted-foreground">
              Ahora son {memberCount}. Compartí el código de invitación desde{" "}
              <Link to="/app/team" className="text-amber underline underline-offset-4">
                Equipo
              </Link>
              .
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Tipo de partida</Label>
            <SegmentedControl value={type} onChange={onType} options={SCRIM_TYPES} aria-label="Tipo de partida" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="map">Mapa</Label>
            <Select value={map} onValueChange={onMap}>
              <SelectTrigger id="map" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {VALORANT_MAPS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <MapImage map={map} variant="strip" className="mt-2 h-24 w-full" eager />
          </div>

          {errorText ? <FormMessage kind="error">{errorText}</FormMessage> : null}

          <Button
            size="lg"
            className="w-full"
            disabled={!file || blocked || analyzing}
            onClick={onAnalyze}
          >
            <Sparkles data-icon="inline-start" />
            {analyzing ? "Analizando la captura…" : "Analizar con IA"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Funciona mejor con la pantalla final del scoreboard, con los diez jugadores visibles.
          </p>
        </div>

        {analyzing ? (
          <AnalysisProgress />
        ) : (
          <FilePicker file={file} onChange={onFile} previewUrl={previewUrl} disabled={blocked} />
        )}
      </div>
    </div>
  );
}

export default UploadStep;
