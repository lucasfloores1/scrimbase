import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { scrimsApi } from "@/shared/api/scrims.api";
import type {
  CreateScrimDto,
  ParseScrimScreenshotResponseDto,
  ScrimOutcome,
  ScrimPlayerStatDto,
  ScrimType,
} from "@/shared/types/dto";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const MAPS = [
  "Ascent",
  "Bind",
  "Breeze",
  "Fracture",
  "Haven",
  "Icebox",
  "Lotus",
  "Pearl",
  "Split",
  "Sunset",
];

const TYPES: Array<{ value: ScrimType; label: string }> = [
  { value: "SCRIM", label: "Scrim" },
  { value: "PREMIER", label: "Premier" },
  { value: "TOURNAMENT", label: "Torneo" },
];

function toIntSafe(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

function outcomeBadge(outcome: ScrimOutcome) {
  if (outcome === "WIN")
    return (
      <Badge className="bg-emerald-600/15 text-emerald-200 border-emerald-600/30" variant="outline">
        Victoria
      </Badge>
    );
  if (outcome === "LOSS")
    return (
      <Badge className="bg-red-600/15 text-red-200 border-red-600/30" variant="outline">
        Derrota
      </Badge>
    );
  return (
    <Badge className="bg-slate-600/15 text-slate-200 border-slate-600/30" variant="outline">
      Empate
    </Badge>
  );
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Ocurrió un error.";
}

function makeEmptyDraft(type: ScrimType, map: string): CreateScrimDto {
  const emptyPlayer: ScrimPlayerStatDto = {
    displayName: "UNKNOWN",
    agent: "UNKNOWN",
    kills: 0,
    deaths: 0,
    assists: 0,
    acs: 0,
  };

  return {
    type,
    map,
    teamRounds: 0,
    enemyRounds: 0,
    teamStats: [emptyPlayer, emptyPlayer, emptyPlayer, emptyPlayer, emptyPlayer].map((p) => ({ ...p })),
    enemyComposition: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
  };
}

export default function ScrimCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const teamId = user?.teamMember?.teamId ?? null;

  // Paso 1
  const [type, setType] = React.useState<ScrimType>("SCRIM");
  const [map, setMap] = React.useState<string>(MAPS[0]);
  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  // Paso 2
  const [parse, setParse] = React.useState<ParseScrimScreenshotResponseDto | null>(null);
  const [draft, setDraft] = React.useState<CreateScrimDto | null>(null);

  React.useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const parseMutation = useMutation({
    mutationFn: async () => {
      if (!teamId) throw new Error("No hay teamId disponible.");
      if (!file) throw new Error("Falta la captura.");

      return scrimsApi.parseScreenshot(teamId, file, { type, map });
    },
    onSuccess: (res) => {
      setParse(res);
      // draft viene exactamente como CreateScrimDto + outcome
      console.log(res);      
      setDraft(res.draft);
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!teamId) throw new Error("No hay teamId disponible.");
      if (!file) throw new Error("Falta la captura.");
      if (!draft) throw new Error("No hay datos para guardar.");

      // Validación mínima del lado UI (sin reemplazar backend):
      if (draft.teamStats.length !== 5) throw new Error("Team stats debe tener 5 jugadores.");
      if (draft.enemyComposition.length !== 5) throw new Error("Enemy composition debe tener 5 agentes.");

      return scrimsApi.create(teamId, file, draft);
    },
    onSuccess: () => {
      navigate("/app/scrims", { replace: true });
    },
  });

  const step = draft ? 2 : 1;

  if (!teamId) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-slate-100">Subir scrim</h1>
        <p className="text-sm text-slate-400">Necesitás pertenecer a un equipo para subir scrims.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-100">
              Subir scrim
            </h1>
            <Badge variant="outline" className="border-slate-700 bg-slate-950 text-slate-200">
              Paso {step} de 2
            </Badge>
          </div>
          <p className="text-sm text-slate-400">
            {step === 1
              ? "Cargá la captura y ejecutá el análisis con IA."
              : "Revisá el draft y confirmá para guardar."}
          </p>
        </div>

        <div className="flex gap-2">
          {step === 2 ? (
            <Button
              variant="outline"
              className="border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-900"
              onClick={() => {
                setDraft(null);
                setParse(null);
              }}
            >
              Volver
            </Button>
          ) : null}

          <Button
            variant="outline"
            className="border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-900"
            onClick={() => navigate("/app/scrims")}
          >
            Cancelar
          </Button>
        </div>
      </header>

      <Separator className="bg-slate-800" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Izquierda */}
        <Card className="border-slate-800 bg-slate-950/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-200">
              {step === 1 ? "Análisis" : "Confirmación"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {step === 1 ? (
              <>
                <div className="space-y-2">
                  <Label className="text-slate-200">Tipo</Label>
                  <Select value={type} onValueChange={(v) => setType(v as ScrimType)}>
                    <SelectTrigger className="border-slate-800 bg-slate-950/40 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-slate-800 bg-slate-950 text-slate-100">
                      {TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Mapa</Label>
                  <Select value={map} onValueChange={setMap}>
                    <SelectTrigger className="border-slate-800 bg-slate-950/40 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-slate-800 bg-slate-950 text-slate-100">
                      {MAPS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Captura</Label>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="border-slate-800 bg-slate-950/40 text-slate-100 file:text-slate-200"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                  <p className="text-xs text-slate-500">
                    El backend valida tamaño y tipo. Ideal: scoreboard o resultado.
                  </p>
                </div>

                {parseMutation.isError ? (
                  <div className="rounded-md border border-red-700/30 bg-red-600/10 px-3 py-2 text-sm text-red-200">
                    {errorMessage(parseMutation.error)}
                  </div>
                ) : null}

                <Button
                  className="w-full bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60"
                  disabled={!file || parseMutation.isPending}
                  onClick={() => parseMutation.mutate()}
                >
                  {parseMutation.isPending ? "Analizando..." : "Analizar captura"}
                </Button>
              </>
            ) : (
              <>
                {/* warnings */}
                {parse?.warnings?.length ? (
                  <div className="rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2">
                    <div className="text-sm font-medium text-slate-200">Advertencias</div>
                    <ul className="mt-1 list-disc pl-5 text-sm text-slate-400">
                      {parse.warnings.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {/* outcome */}
                {parse?.draft?.outcome ? (
                  <div className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2">
                    <div className="text-sm text-slate-200">Resultado detectado</div>
                    {outcomeBadge(parse.draft.outcome)}
                  </div>
                ) : null}

                {/* rounds */}
                {draft ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-slate-200">Rounds (tu equipo)</Label>
                        <Input
                          inputMode="numeric"
                          value={String(draft.teamRounds)}
                          onChange={(e) => setDraft({ ...draft, teamRounds: toIntSafe(e.target.value) })}
                          className="border-slate-800 bg-slate-950/40 text-slate-100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-200">Rounds (rival)</Label>
                        <Input
                          inputMode="numeric"
                          value={String(draft.enemyRounds)}
                          onChange={(e) => setDraft({ ...draft, enemyRounds: toIntSafe(e.target.value) })}
                          className="border-slate-800 bg-slate-950/40 text-slate-100"
                        />
                      </div>
                    </div>

                    {/* enemy composition (5) */}
                    <div className="space-y-2">
                      <Label className="text-slate-200">Composición rival (5 agentes)</Label>
                      <Textarea
                        value={draft.enemyComposition.join("\n")}
                        onChange={(e) => {
                          const list = e.target.value
                            .split("\n")
                            .map((s) => s.trim())
                            .filter(Boolean);
                          setDraft({ ...draft, enemyComposition: list });
                        }}
                        className="min-h-[120px] border-slate-800 bg-slate-950/40 text-slate-100"
                        placeholder={"Jett\nSova\nOmen\nKAY/O\nKilljoy"}
                      />
                      <p className="text-xs text-slate-500">1 agente por línea. Deben ser 5.</p>
                    </div>

                    {/* team stats */}
                    <div className="space-y-2">
                      <Label className="text-slate-200">Team stats (5 jugadores)</Label>

                      <div className="space-y-2">
                        {draft.teamStats.map((p, idx) => (
                          <div
                            key={idx}
                            className="rounded-md border border-slate-800 bg-slate-950/40 p-3"
                          >
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-12">
                              <Input
                                className="md:col-span-4 border-slate-800 bg-slate-950/20 text-slate-100"
                                value={p.displayName ?? ""}
                                onChange={(e) => {
                                  const next = [...draft.teamStats];
                                  next[idx] = { ...next[idx], displayName: e.target.value };
                                  setDraft({ ...draft, teamStats: next });
                                }}
                                placeholder="displayName (o UNKNOWN)"
                              />
                              <Input
                                className="md:col-span-3 border-slate-800 bg-slate-950/20 text-slate-100"
                                value={p.agent}
                                onChange={(e) => {
                                  const next = [...draft.teamStats];
                                  next[idx] = { ...next[idx], agent: e.target.value };
                                  setDraft({ ...draft, teamStats: next });
                                }}
                                placeholder="agent"
                              />
                              <Input
                                className="md:col-span-1 border-slate-800 bg-slate-950/20 text-slate-100"
                                value={String(p.kills)}
                                onChange={(e) => {
                                  const next = [...draft.teamStats];
                                  next[idx] = { ...next[idx], kills: toIntSafe(e.target.value) };
                                  setDraft({ ...draft, teamStats: next });
                                }}
                                placeholder="K"
                              />
                              <Input
                                className="md:col-span-1 border-slate-800 bg-slate-950/20 text-slate-100"
                                value={String(p.deaths)}
                                onChange={(e) => {
                                  const next = [...draft.teamStats];
                                  next[idx] = { ...next[idx], deaths: toIntSafe(e.target.value) };
                                  setDraft({ ...draft, teamStats: next });
                                }}
                                placeholder="D"
                              />
                              <Input
                                className="md:col-span-1 border-slate-800 bg-slate-950/20 text-slate-100"
                                value={String(p.assists)}
                                onChange={(e) => {
                                  const next = [...draft.teamStats];
                                  next[idx] = { ...next[idx], assists: toIntSafe(e.target.value) };
                                  setDraft({ ...draft, teamStats: next });
                                }}
                                placeholder="A"
                              />
                              <Input
                                className="md:col-span-2 border-slate-800 bg-slate-950/20 text-slate-100"
                                value={String(p.acs)}
                                onChange={(e) => {
                                  const next = [...draft.teamStats];
                                  next[idx] = { ...next[idx], acs: toIntSafe(e.target.value) };
                                  setDraft({ ...draft, teamStats: next });
                                }}
                                placeholder="ACS"
                              />
                            </div>

                            {/* Nota: userId existe a veces (match del backend). No lo renderizamos como child. */}
                            {p.userId ? (
                              <div className="mt-2 text-xs text-slate-500">
                                userId vinculado: <span className="text-slate-300">{p.userId}</span>
                              </div>
                            ) : (
                              <div className="mt-2 text-xs text-slate-500">
                                Sin match de usuario (userId). Confirmá displayName.
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {createMutation.isError ? (
                      <div className="rounded-md border border-red-700/30 bg-red-600/10 px-3 py-2 text-sm text-red-200">
                        {errorMessage(createMutation.error)}
                      </div>
                    ) : null}

                    <Button
                      className="w-full bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60"
                      disabled={createMutation.isPending}
                      onClick={() => createMutation.mutate()}
                    >
                      {createMutation.isPending ? "Guardando..." : "Confirmar y guardar"}
                    </Button>

                    <p className="text-xs text-slate-500">
                      El backend recalcula outcome y valida reglas (rondas, tipos, etc.).
                    </p>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    className="border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-900"
                    onClick={() => setDraft(makeEmptyDraft(type, map))}
                  >
                    No vino draft: crear borrador manual
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Derecha: preview + rawOutputId */}
        <Card className="border-slate-800 bg-slate-950/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-200">Vista previa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {previewUrl ? (
              <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950/40">
                <img src={previewUrl} alt="Captura" className="block w-full" />
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-800 bg-slate-950/20 p-6">
                <p className="text-sm text-slate-400">Seleccioná una captura para ver la vista previa.</p>
              </div>
            )}

            {parse?.rawOutputId ? (
              <div className="rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2">
                <div className="text-xs text-slate-400">rawOutputId</div>
                <div className="text-sm text-slate-200">{parse.rawOutputId}</div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}