import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { useTeamId } from "@/shared/hooks/useTeam";
import { useObjectUrl } from "@/shared/hooks/useObjectUrl";
import { SIDES, VALORANT_MAPS } from "@/shared/constants/valorant";
import type { MatchSide } from "@/shared/types/dto";
import { errorMessage } from "@/shared/lib/format";
import { useCreateStrat } from "../hooks/useCreateStrat";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/shared/ui/layout/PageHeader";
import { FilePicker } from "@/shared/ui/forms/FilePicker";
import { SegmentedControl } from "@/shared/ui/forms/SegmentedControl";
import { FormMessage } from "@/shared/ui/feedback/FormMessage";
import { MapImage } from "@/shared/ui/valorant/MapImage";

export function StratCreatePage() {
  const navigate = useNavigate();
  const teamId = useTeamId();
  const { create, isPending, error } = useCreateStrat();

  const [name, setName] = useState("");
  const [map, setMap] = useState<string>(VALORANT_MAPS[0]);
  const [side, setSide] = useState<MatchSide>("ATTACK");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const previewUrl = useObjectUrl(file);

  const canSubmit = !!teamId && !!file && name.trim().length > 0 && !isPending;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    create({ teamId: teamId!, file: file!, dto: { name: name.trim(), map, side, notes: notes.trim() || undefined } });
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/app/strats">
          <ArrowLeft data-icon="inline-start" />
          Strats
        </Link>
      </Button>

      <PageHeader title="Nueva strat" description="Mapa, lado, captura del setup y lo que el equipo tiene que saber." />

      <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="strat-name">Nombre</Label>
            <Input
              id="strat-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Default A con Sova"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="strat-map">Mapa</Label>
            <Select value={map} onValueChange={setMap}>
              <SelectTrigger id="strat-map" className="w-full">
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
            <MapImage map={map} variant="strip" className="mt-2 h-20 w-full" />
          </div>

          <div className="space-y-2">
            <Label>Lado</Label>
            <SegmentedControl value={side} onChange={setSide} options={SIDES} aria-label="Lado" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="strat-notes">Notas</Label>
            <Textarea
              id="strat-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Timing, utilidad, quién va a dónde…"
              className="min-h-36"
              maxLength={5000}
            />
          </div>

          {error ? <FormMessage kind="error">{errorMessage(error, "No se pudo crear la strat.")}</FormMessage> : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => navigate("/app/strats")}>
              Cancelar
            </Button>
            <Button type="submit" size="lg" disabled={!canSubmit}>
              {isPending ? "Guardando…" : "Guardar strat"}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Captura del setup</Label>
          <FilePicker file={file} onChange={setFile} previewUrl={previewUrl} disabled={isPending} />
        </div>
      </form>
    </div>
  );
}

export default StratCreatePage;
