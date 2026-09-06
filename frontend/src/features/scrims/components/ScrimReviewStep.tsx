import type {
  CreateScrimDto,
  ParseScrimScreenshotResponseDto,
  ScrimPlayerStatDto,
} from "@/shared/types/dto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { OutcomePill } from "@/shared/ui/OutcomePill";
import { cn } from "@/lib/utils";
import { Check, Loader2, UserRoundCheck, UserRoundX } from "lucide-react";
import {
  VALORANT_AGENTS_WITH_UNKNOWN,
  type ValorantAgentOrUnknown,
} from "@/shared/constants/valorant";
import { ScreenshotPreview } from "@/shared/ui/ScreenshotPreview";

function toIntSafe(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

type Props = {
  draft: CreateScrimDto & { outcome?: ParseScrimScreenshotResponseDto["draft"]["outcome"] };
  warnings?: string[];
  previewUrl: string | null;
  isSaving: boolean;
  error?: string | null;
  onChange: (next: CreateScrimDto & { outcome?: Props["draft"]["outcome"] }) => void;
  onSave: () => void;
  onBack: () => void;
};

function PlayerRow({
  player,
  index,
  onUpdate,
}: {
  player: ScrimPlayerStatDto;
  index: number;
  onUpdate: (next: ScrimPlayerStatDto) => void;
}) {
  const matched = Boolean(player.userId);

  return (
    <div
      className={cn(
        "grid grid-cols-12 items-center gap-2 rounded-xl border bg-surface px-3 py-2.5 transition-colors",
        matched ? "border-border" : "border-amber-300/60 bg-amber-50/40",
      )}
    >
      <div className="col-span-12 sm:col-span-1 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-mono tabular-nums">{index + 1}</span>
        {matched ? (
          <UserRoundCheck className="h-3.5 w-3.5 text-win" aria-label="Matched" />
        ) : (
          <UserRoundX className="h-3.5 w-3.5 text-amber-600" aria-label="Unmatched" />
        )}
      </div>

      <Input
        className="col-span-12 sm:col-span-4 h-8 bg-transparent border-transparent hover:border-border focus-visible:border-ring"
        value={player.displayName ?? ""}
        onChange={(e) => onUpdate({ ...player, displayName: e.target.value })}
        placeholder="Player"
      />
      <div className="col-span-6 sm:col-span-2">
        <Select
          value={player.agent}
          onValueChange={(v) => onUpdate({ ...player, agent: v as ValorantAgentOrUnknown })}
        >
          <SelectTrigger className="h-8 w-full bg-transparent border-transparent hover:border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VALORANT_AGENTS_WITH_UNKNOWN.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Input
        className="col-span-2 sm:col-span-1 h-8 text-center bg-transparent border-transparent hover:border-border focus-visible:border-ring tabular-nums"
        value={String(player.kills)}
        onChange={(e) => onUpdate({ ...player, kills: toIntSafe(e.target.value) })}
        aria-label="Kills"
      />
      <Input
        className="col-span-2 sm:col-span-1 h-8 text-center bg-transparent border-transparent hover:border-border focus-visible:border-ring tabular-nums"
        value={String(player.deaths)}
        onChange={(e) => onUpdate({ ...player, deaths: toIntSafe(e.target.value) })}
        aria-label="Deaths"
      />
      <Input
        className="col-span-2 sm:col-span-1 h-8 text-center bg-transparent border-transparent hover:border-border focus-visible:border-ring tabular-nums"
        value={String(player.assists)}
        onChange={(e) => onUpdate({ ...player, assists: toIntSafe(e.target.value) })}
        aria-label="Assists"
      />
      <Input
        className="col-span-6 sm:col-span-2 h-8 text-center bg-transparent border-transparent hover:border-border focus-visible:border-ring tabular-nums"
        value={String(player.acs)}
        onChange={(e) => onUpdate({ ...player, acs: toIntSafe(e.target.value) })}
        aria-label="ACS"
      />
    </div>
  );
}

export function ScrimReviewStep({
  draft,
  warnings,
  previewUrl,
  isSaving,
  error,
  onChange,
  onSave,
  onBack,
}: Props) {
  const scoreOk =
    draft.teamStats.length === 5 &&
    draft.enemyComposition.length === 5 &&
    Boolean(draft.opponentName?.trim());

  return (
    <div className="space-y-8 animate-rise">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Step 2 · Review
          </p>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Check extracted data
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg">
            Confirm score, agents and player matches before saving to your team history.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button className="gap-2" disabled={isSaving || !scoreOk} onClick={onSave}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Confirm & save
              </>
            )}
          </Button>
        </div>
      </div>

      {warnings && warnings.length > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-medium text-amber-900">Needs attention</p>
          <ul className="mt-1.5 space-y-1 text-sm text-amber-800/90">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-signal text-[10px] font-bold text-signal-foreground">
            ✓
          </span>
          Extraction looks clean — quick review recommended.
        </div>
      )}

      <div className="space-y-2">
        <ScreenshotPreview
          src={previewUrl}
          emptyLabel="No preview"
          maxHeightClassName="max-h-[min(42vh,420px)]"
        />
        {previewUrl ? (
          <p className="px-0.5 text-xs text-muted-foreground">
            Click the screenshot to expand while you verify names and ACS.
          </p>
        ) : null}
      </div>

      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-surface p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Match</p>
              <p className="font-display text-lg font-semibold tracking-tight">
                {draft.map} · {draft.type}
              </p>
            </div>
            {draft.outcome ? <OutcomePill outcome={draft.outcome} /> : null}
          </div>

          <div className="space-y-2">
            <Label>Opponent team</Label>
            <Input
              className="h-11"
              value={draft.opponentName ?? ""}
              onChange={(e) => onChange({ ...draft, opponentName: e.target.value })}
              placeholder="e.g. KRÜ, Leviatán, 9z"
            />
            <p className="text-xs text-muted-foreground">
              Required — used later to filter scrims vs that org.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Your rounds</Label>
              <Input
                inputMode="numeric"
                className="h-11 font-display text-xl tabular-nums"
                value={String(draft.teamRounds)}
                onChange={(e) =>
                  onChange({ ...draft, teamRounds: toIntSafe(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Enemy rounds</Label>
              <Input
                inputMode="numeric"
                className="h-11 font-display text-xl tabular-nums"
                value={String(draft.enemyRounds)}
                onChange={(e) =>
                  onChange({ ...draft, enemyRounds: toIntSafe(e.target.value) })
                }
              />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-end justify-between px-1">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Team stats</p>
              <p className="text-sm text-muted-foreground">Player · Agent · K / D / A · ACS</p>
            </div>
          </div>

          <div className="hidden sm:grid grid-cols-12 gap-2 px-3 text-[10px] uppercase tracking-wider text-muted-foreground">
            <span className="col-span-1">#</span>
            <span className="col-span-4">Player</span>
            <span className="col-span-2">Agent</span>
            <span className="col-span-1 text-center">K</span>
            <span className="col-span-1 text-center">D</span>
            <span className="col-span-1 text-center">A</span>
            <span className="col-span-2 text-center">ACS</span>
          </div>

          <div className="space-y-2">
            {draft.teamStats.map((p, idx) => (
              <PlayerRow
                key={idx}
                index={idx}
                player={p}
                onUpdate={(next) => {
                  const teamStats = [...draft.teamStats];
                  teamStats[idx] = next;
                  onChange({ ...draft, teamStats });
                }}
              />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5 space-y-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Enemy composition
            </p>
            <p className="text-sm text-muted-foreground">Five agents, one per field</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Select
                key={idx}
                value={draft.enemyComposition[idx] ?? "UNKNOWN"}
                onValueChange={(v) => {
                  const enemyComposition = [...draft.enemyComposition] as ValorantAgentOrUnknown[];
                  while (enemyComposition.length < 5) enemyComposition.push("UNKNOWN");
                  enemyComposition[idx] = v as ValorantAgentOrUnknown;
                  onChange({
                    ...draft,
                    enemyComposition: enemyComposition.slice(0, 5),
                  });
                }}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder={`Agent ${idx + 1}`} />
                </SelectTrigger>
                <SelectContent>
                  {VALORANT_AGENTS_WITH_UNKNOWN.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        </section>

        {error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  );
}
