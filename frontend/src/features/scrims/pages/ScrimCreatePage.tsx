import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { scrimsApi } from "@/shared/api/scrims.api";
import type {
  CreateScrimDto,
  ParseScrimScreenshotResponseDto,
  ScrimPlayerStatDto,
  ScrimType,
} from "@/shared/types/dto";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { ScrimUploadStep } from "@/features/scrims/components/ScrimUploadStep";
import { ScrimReviewStep } from "@/features/scrims/components/ScrimReviewStep";
import { cn } from "@/lib/utils";
import { VALORANT_MAPS, type ValorantMap } from "@/shared/constants/valorant";

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}

function makeEmptyDraft(type: ScrimType, map: ValorantMap): CreateScrimDto & { outcome?: "WIN" | "LOSS" | "DRAW" } {
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
    opponentName: "",
    teamRounds: 0,
    enemyRounds: 0,
    outcome: "DRAW",
    teamStats: Array.from({ length: 5 }, () => ({ ...emptyPlayer })),
    enemyComposition: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
  };
}

export default function ScrimCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const teamId = user?.teamMember?.teamId ?? null;

  const [type, setType] = React.useState<ScrimType>("SCRIM");
  const [map, setMap] = React.useState<ValorantMap>(VALORANT_MAPS[0]);
  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const [parse, setParse] = React.useState<ParseScrimScreenshotResponseDto | null>(null);
  const [draft, setDraft] = React.useState<
    (CreateScrimDto & { outcome?: "WIN" | "LOSS" | "DRAW" }) | null
  >(null);

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
      if (!teamId) throw new Error("You need a team to upload scrims.");
      if (!file) throw new Error("Add a screenshot first.");
      return scrimsApi.parseScreenshot(teamId, file, { type, map });
    },
    onSuccess: (res) => {
      setParse(res);
      setDraft({
        ...res.draft,
        opponentName: res.draft.opponentName ?? "",
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!teamId) throw new Error("You need a team to upload scrims.");
      if (!file) throw new Error("Add a screenshot first.");
      if (!draft) throw new Error("Nothing to save.");
      if (!draft.opponentName?.trim()) {
        throw new Error("Opponent team name is required.");
      }
      if (draft.teamStats.length !== 5) throw new Error("Team stats must have 5 players.");
      if (draft.enemyComposition.length !== 5) {
        throw new Error("Enemy composition must have 5 agents.");
      }
      return scrimsApi.create(teamId, file, {
        ...draft,
        opponentName: draft.opponentName.trim(),
      });
    },
    onSuccess: () => {
      navigate("/app/scrims", { replace: true });
    },
  });

  const step = draft ? 2 : 1;

  if (!teamId) {
    return (
      <PageHeader
        title="Upload scrim"
        description="Join or create a team before uploading scrims."
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Scrims"
        title="Upload scrim"
        description="Capture · verify · save. Built for fast post-session logging."
        actions={
          <Button variant="outline" onClick={() => navigate("/app/scrims")}>
            Cancel
          </Button>
        }
      />

      <div className="flex items-center gap-2">
        {[1, 2].map((n) => (
          <div key={n} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                step === n
                  ? "bg-ink text-signal"
                  : step > n
                    ? "bg-signal text-signal-foreground"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {n}
            </span>
            <span
              className={cn(
                "text-xs font-medium",
                step === n ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {n === 1 ? "Upload" : "Review"}
            </span>
            {n === 1 ? <span className="mx-1 h-px w-8 bg-border" /> : null}
          </div>
        ))}
      </div>

      {step === 1 ? (
        <ScrimUploadStep
          type={type}
          map={map}
          file={file}
          previewUrl={previewUrl}
          isParsing={parseMutation.isPending}
          error={parseMutation.isError ? errorMessage(parseMutation.error) : null}
          onTypeChange={setType}
          onMapChange={setMap}
          onFileChange={setFile}
          onAnalyze={() => parseMutation.mutate()}
          onManualDraft={() => {
            if (!file) return;
            setParse(null);
            setDraft(makeEmptyDraft(type, map));
          }}
        />
      ) : draft ? (
        <ScrimReviewStep
          draft={draft}
          warnings={parse?.warnings}
          previewUrl={previewUrl}
          isSaving={createMutation.isPending}
          error={createMutation.isError ? errorMessage(createMutation.error) : null}
          onChange={setDraft}
          onSave={() => createMutation.mutate()}
          onBack={() => {
            setDraft(null);
            setParse(null);
          }}
        />
      ) : null}
    </div>
  );
}
