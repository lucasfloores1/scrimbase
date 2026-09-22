import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ImageUp, Lock, UserRound } from "lucide-react";

import { useAuth } from "@/app/providers/AuthProvider";
import { useI18n } from "@/app/providers/I18nProvider";
import { billingQueryKey, useBilling } from "@/features/billing/hooks/useBilling";
import { PaywallCard } from "@/features/billing/components/PaywallCard";
import { AnalysisProgress } from "@/features/scrims/components/AnalysisProgress";
import { scrimsApi } from "@/shared/api/scrims.api";
import { teamsApi } from "@/shared/api/teams.api";
import type { TeamMemberListItem } from "@/shared/types/models";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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

const TYPES: ScrimType[] = ["SCRIM", "PREMIER", "TOURNAMENT"];

const UNASSIGNED = "__unassigned__";

function toIntSafe(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0;
}

function errorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const res = (err as { response?: { data?: { error?: { message?: string } } } }).response;
    const message = res?.data?.error?.message;
    if (message) return message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

function isQuotaError(err: unknown) {
  if (!err || typeof err !== "object" || !("response" in err)) return false;
  const res = (err as { response?: { status?: number; data?: { error?: { error?: string } } } }).response;
  return res?.status === 402 || res?.data?.error?.error === "SCRIM_QUOTA_EXCEEDED";
}

function memberLabel(member: TeamMemberListItem) {
  return member.user?.riotId || member.user?.username || member.user?.id || "—";
}

function typeKey(value: ScrimType) {
  if (value === "PREMIER") return "type.premier" as const;
  if (value === "TOURNAMENT") return "type.tournament" as const;
  return "type.scrim" as const;
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
    teamStats: Array.from({ length: 5 }, () => ({ ...emptyPlayer })),
    enemyComposition: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
  };
}

export default function ScrimCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const { user } = useAuth();
  const teamId = user?.teamMember?.teamId ?? null;

  const billing = useBilling();

  const [type, setType] = React.useState<ScrimType>("SCRIM");
  const [map, setMap] = React.useState<string>(MAPS[0]);
  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const [parse, setParse] = React.useState<ParseScrimScreenshotResponseDto | null>(null);
  const [draft, setDraft] = React.useState<CreateScrimDto | null>(null);
  const [clientError, setClientError] = React.useState<string | null>(null);

  const membersQuery = useQuery({
    queryKey: ["team-members", teamId],
    queryFn: teamsApi.getTeamMembers,
    enabled: !!teamId,
    staleTime: 60_000,
  });

  const members = membersQuery.data ?? [];

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
      if (!teamId) throw new Error(t("upload.needTeam"));
      if (!file) throw new Error(t("upload.screenshot"));
      return scrimsApi.parseScreenshot(teamId, file, { type, map });
    },
    onSuccess: (res) => {
      setParse(res);
      setDraft(res.draft);
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!teamId) throw new Error(t("upload.needTeam"));
      if (!file) throw new Error(t("upload.screenshot"));
      if (!draft) throw new Error(t("common.error"));
      return scrimsApi.create(teamId, file, draft);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scrims", teamId] });
      queryClient.invalidateQueries({ queryKey: billingQueryKey(teamId) });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      navigate("/app/scrims", { replace: true });
    },
  });

  const step = draft ? 2 : 1;
  const quotaBlocked = billing.status ? !billing.status.canUploadScrim : false;

  function pickFile(next: File | null) {
    setFile(next);
    setClientError(null);
  }

  function assignPlayer(index: number, memberUserId: string | null) {
    if (!draft) return;

    const next = [...draft.teamStats];
    const member = members.find((m) => m.user?.id === memberUserId);

    next[index] = {
      ...next[index],
      userId: memberUserId ?? undefined,
      displayName: member ? memberLabel(member) : "UNKNOWN",
    };

    setDraft({ ...draft, teamStats: next });
    setClientError(null);
  }

  function updateStat(index: number, patch: Partial<ScrimPlayerStatDto>) {
    if (!draft) return;
    const next = [...draft.teamStats];
    next[index] = { ...next[index], ...patch };
    setDraft({ ...draft, teamStats: next });
  }

  function updateEnemyAgent(index: number, value: string) {
    if (!draft) return;
    const next = [...draft.enemyComposition];
    next[index] = value;
    setDraft({ ...draft, enemyComposition: next });
  }

  function save() {
    if (!draft) return;

    const unassigned = draft.teamStats.filter((p) => !p.userId).length;
    if (unassigned > 0) {
      setClientError(t("upload.missingPlayers", { count: unassigned }));
      return;
    }

    const ids = draft.teamStats.map((p) => p.userId);
    if (new Set(ids).size !== ids.length) {
      setClientError(t("upload.duplicatePlayers"));
      return;
    }

    setClientError(null);
    createMutation.mutate();
  }

  if (!teamId) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-foreground">{t("upload.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("upload.needTeam")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
              {t("upload.title")}
            </h1>
            <Badge variant="outline">{t("upload.step", { current: step })}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {step === 1 ? t("upload.step1Desc") : t("upload.step2Desc")}
          </p>
        </div>

        <Button variant="outline" onClick={() => navigate("/app/scrims")}>
          {t("common.cancel")}
        </Button>
      </header>

      <Separator />

      {quotaBlocked && billing.status && step === 1 ? <PaywallCard status={billing.status} /> : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {step === 1 ? t("upload.analysis") : t("upload.confirmation")}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {step === 1 ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t("upload.typeLabel")}</Label>
                    <Select value={type} onValueChange={(v) => setType(v as ScrimType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TYPES.map((value) => (
                          <SelectItem key={value} value={value}>
                            {t(typeKey(value))}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("upload.mapLabel")}</Label>
                    <Select value={map} onValueChange={setMap}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MAPS.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("upload.screenshot")}</Label>

                  <label
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      pickFile(e.dataTransfer.files?.[0] ?? null);
                    }}
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center transition-colors",
                      isDragging ? "border-brand bg-brand/5" : "border-border hover:bg-accent/40"
                    )}
                  >
                    <ImageUp className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      {file ? file.name : t("upload.dropHint")}
                    </span>
                    <span className="text-xs text-muted-foreground">{t("upload.screenshotHint")}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>

                <AnalysisProgress active={parseMutation.isPending} done={!!draft} />

                {parseMutation.isError ? (
                  isQuotaError(parseMutation.error) && billing.status ? (
                    <PaywallCard status={billing.status} />
                  ) : (
                    <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger-foreground">
                      {errorMessage(parseMutation.error, t("common.error"))}
                    </div>
                  )
                ) : null}

                <Button
                  className="w-full bg-brand text-brand-foreground hover:bg-brand-hover disabled:opacity-60"
                  disabled={!file || parseMutation.isPending || quotaBlocked}
                  onClick={() => parseMutation.mutate()}
                >
                  {quotaBlocked ? (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      {t("paywall.badge")}
                    </>
                  ) : parseMutation.isPending ? (
                    t("upload.analyzing")
                  ) : (
                    t("upload.analyze")
                  )}
                </Button>
              </>
            ) : draft ? (
              <>
                {parse?.warnings?.length ? (
                  <div className="rounded-md border border-border bg-muted/40 px-3 py-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      {t("upload.warnings")}
                    </div>
                    <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
                      {parse.warnings.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {parse?.draft?.outcome ? (
                  <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2">
                    <span className="text-sm text-foreground">{t("upload.detectedResult")}</span>
                    <OutcomeBadge outcome={parse.draft.outcome} />
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>{t("upload.teamRounds")}</Label>
                    <Input
                      inputMode="numeric"
                      value={String(draft.teamRounds)}
                      onChange={(e) => setDraft({ ...draft, teamRounds: toIntSafe(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("upload.enemyRounds")}</Label>
                    <Input
                      inputMode="numeric"
                      value={String(draft.enemyRounds)}
                      onChange={(e) => setDraft({ ...draft, enemyRounds: toIntSafe(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("upload.enemyComp")}</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {draft.enemyComposition.map((agent, idx) => (
                      <Input
                        key={idx}
                        value={agent}
                        onChange={(e) => updateEnemyAgent(idx, e.target.value)}
                        placeholder={t("upload.agent")}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{t("upload.enemyCompHint")}</p>
                </div>

                <div className="space-y-2">
                  <Label>{t("upload.teamStats")}</Label>

                  <div className="space-y-2">
                    {draft.teamStats.map((player, idx) => (
                      <PlayerRow
                        key={idx}
                        player={player}
                        members={members}
                        takenIds={draft.teamStats
                          .map((p, i) => (i === idx ? null : p.userId ?? null))
                          .filter((id): id is string => !!id)}
                        onAssign={(memberId) => assignPlayer(idx, memberId)}
                        onChange={(patch) => updateStat(idx, patch)}
                      />
                    ))}
                  </div>
                </div>

                {clientError || createMutation.isError ? (
                  <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger-foreground">
                    {clientError ?? errorMessage(createMutation.error, t("common.error"))}
                  </div>
                ) : null}

                <Button
                  className="w-full bg-brand text-brand-foreground hover:bg-brand-hover disabled:opacity-60"
                  disabled={createMutation.isPending}
                  onClick={save}
                >
                  {createMutation.isPending ? t("upload.saving") : t("upload.save")}
                </Button>

                <p className="text-xs text-muted-foreground">{t("upload.saveHint")}</p>
              </>
            ) : (
              <Button variant="outline" onClick={() => setDraft(makeEmptyDraft(type, map))}>
                {t("upload.noDraft")}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("upload.preview")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {previewUrl ? (
              <div className="overflow-hidden rounded-lg border border-border">
                <img src={previewUrl} alt={t("upload.screenshot")} className="block w-full" />
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-6">
                <p className="text-sm text-muted-foreground">{t("upload.previewEmpty")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PlayerRow({
  player,
  members,
  takenIds,
  onAssign,
  onChange,
}: {
  player: ScrimPlayerStatDto;
  members: TeamMemberListItem[];
  takenIds: string[];
  onAssign: (memberUserId: string | null) => void;
  onChange: (patch: Partial<ScrimPlayerStatDto>) => void;
}) {
  const { t } = useI18n();
  const matched = !!player.userId;

  return (
    <div
      className={cn(
        "space-y-2 rounded-md border p-3",
        matched ? "border-border bg-muted/20" : "border-amber-500/40 bg-amber-500/5"
      )}
    >
      <div className="grid grid-cols-1 gap-2 md:grid-cols-12">
        <div className="md:col-span-5">
          <Select
            value={player.userId ?? UNASSIGNED}
            onValueChange={(value) => onAssign(value === UNASSIGNED ? null : value)}
          >
            <SelectTrigger className={cn("w-full", !matched && "border-amber-500/50")}>
              <SelectValue placeholder={t("upload.pickPlayer")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNASSIGNED}>{t("common.unassigned")}</SelectItem>
              {members.map((member) => {
                const id = member.user?.id;
                if (!id) return null;
                const taken = takenIds.includes(id);

                return (
                  <SelectItem key={id} value={id} disabled={taken}>
                    {memberLabel(member)}
                    {taken ? ` · ${t("upload.alreadyPicked")}` : ""}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <Input
          className="md:col-span-3"
          value={player.agent}
          onChange={(e) => onChange({ agent: e.target.value })}
          placeholder={t("upload.agent")}
        />

        <Input
          className="md:col-span-1"
          value={String(player.kills)}
          onChange={(e) => onChange({ kills: toIntSafe(e.target.value) })}
          placeholder="K"
        />
        <Input
          className="md:col-span-1"
          value={String(player.deaths)}
          onChange={(e) => onChange({ deaths: toIntSafe(e.target.value) })}
          placeholder="D"
        />
        <Input
          className="md:col-span-1"
          value={String(player.assists)}
          onChange={(e) => onChange({ assists: toIntSafe(e.target.value) })}
          placeholder="A"
        />
        <Input
          className="md:col-span-1"
          value={String(player.acs)}
          onChange={(e) => onChange({ acs: toIntSafe(e.target.value) })}
          placeholder="ACS"
        />
      </div>

      {matched ? (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <UserRound className="h-3.5 w-3.5" />
          {t("upload.matched", { name: player.displayName ?? "" })}
        </div>
      ) : (
        <div className="flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            {t("upload.unmatched")}. {t("upload.unmatchedHint")}
          </span>
        </div>
      )}
    </div>
  );
}

function OutcomeBadge({ outcome }: { outcome: ScrimOutcome }) {
  const { t } = useI18n();

  if (outcome === "WIN") {
    return (
      <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
        {t("outcome.win")}
      </Badge>
    );
  }

  if (outcome === "LOSS") {
    return (
      <Badge variant="outline" className="border-danger/30 bg-danger/10 text-danger">
        {t("outcome.loss")}
      </Badge>
    );
  }

  return <Badge variant="outline">{t("outcome.draw")}</Badge>;
}
