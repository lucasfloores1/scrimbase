import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { scrimsApi } from "@/shared/api/scrims.api";
import { useTeamId, useTeamMembers } from "@/shared/hooks/useTeam";
import { useObjectUrl } from "@/shared/hooks/useObjectUrl";
import { useToast } from "@/shared/ui/toast/useToast";
import { isQuotaError, quotaExhausted, useSubscription } from "@/shared/hooks/useSubscription";
import { QuotaBanner } from "@/features/billing/components/QuotaBanner";
import { UpgradeDialog } from "@/features/billing/components/UpgradeDialog";
import type { CreateScrimDto, ScrimPlayerStatDto, ScrimType } from "@/shared/types/dto";
import { VALORANT_MAPS } from "@/shared/constants/valorant";
import { errorMessage } from "@/shared/lib/format";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/shared/ui/layout/PageHeader";
import { UploadStep } from "@/features/scrims/components/UploadStep";
import { ReviewStep } from "@/features/scrims/components/ReviewStep";

/** Misma regla que TeamFullGuard en el backend. */
const MIN_MEMBERS = 5;

/** El backend usa "UNKNOWN" para lo que la IA no reconoció; en la UI eso es "vacío". */
const clean = (v?: string) => {
  const s = (v ?? "").trim();
  return s === "UNKNOWN" ? "" : s;
};

export default function ScrimCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const teamId = useTeamId();
  const members = useTeamMembers();
  const memberCount = members.data?.length ?? null;
  const teamTooSmall = memberCount !== null && memberCount < MIN_MEMBERS;

  const { subscription } = useSubscription();
  const outOfQuota = quotaExhausted(subscription);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const [type, setType] = useState<ScrimType>("SCRIM");
  const [map, setMap] = useState<string>(VALORANT_MAPS[0]);
  const [file, setFile] = useState<File | null>(null);
  const previewUrl = useObjectUrl(file);

  const [warnings, setWarnings] = useState<string[]>([]);
  const [draft, setDraft] = useState<CreateScrimDto | null>(null);

  const parseMutation = useMutation({
    mutationFn: () => scrimsApi.parseScreenshot(teamId!, file!, { type, map }),
    onError: (err) => {
      if (isQuotaError(err)) setUpgradeOpen(true);
    },
    onSuccess: (res) => {
      setWarnings(res.warnings ?? []);
      setDraft({
        type: res.draft.type ?? type,
        map: res.draft.map ?? map,
        opponentName: res.draft.opponentName ?? "",
        teamRounds: res.draft.teamRounds,
        enemyRounds: res.draft.enemyRounds,
        teamStats: res.draft.teamStats.map((p) => ({ ...p, agent: clean(p.agent), displayName: clean(p.displayName) })),
        enemyComposition: Array.from({ length: 5 }, (_, i) => clean(res.draft.enemyComposition?.[i])),
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: () => scrimsApi.create(teamId!, file!, draft!),
    onError: (err) => {
      if (isQuotaError(err)) setUpgradeOpen(true);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["scrims"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["subscription"] }),
      ]);
      toast.success("Scrim guardada.");
      navigate("/app/scrims", { replace: true });
    },
  });

  const step = draft ? 2 : 1;

  function patchPlayer(index: number, patch: Partial<ScrimPlayerStatDto>) {
    setDraft((d) => (d ? { ...d, teamStats: d.teamStats.map((p, i) => (i === index ? { ...p, ...patch } : p)) } : d));
  }
  function patchEnemy(index: number, agent: string) {
    setDraft((d) => (d ? { ...d, enemyComposition: d.enemyComposition.map((a, i) => (i === index ? agent : a)) } : d));
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/app/scrims">
          <ArrowLeft data-icon="inline-start" />
          Scrims
        </Link>
      </Button>

      <PageHeader
        title="Subir scrim"
        description={
          step === 1
            ? "Paso 1 de 2 · Elegí mapa y tipo, y subí la captura del scoreboard."
            : "Paso 2 de 2 · Confirmá el rival, los agentes y los jugadores que la IA no reconoció."
        }
      />

      {step === 1 ? (
        <UploadStep
          type={type}
          onType={setType}
          map={map}
          onMap={setMap}
          file={file}
          onFile={setFile}
          previewUrl={previewUrl}
          onAnalyze={() => parseMutation.mutate()}
          analyzing={parseMutation.isPending}
          errorText={parseMutation.isError ? errorMessage(parseMutation.error, "No se pudo analizar la captura.") : undefined}
          teamTooSmall={teamTooSmall}
          memberCount={memberCount}
          minMembers={MIN_MEMBERS}
          quotaBlocked={outOfQuota}
          quotaSlot={<QuotaBanner subscription={subscription} onUpgrade={() => setUpgradeOpen(true)} />}
        />
      ) : draft ? (
        <ReviewStep
          draft={draft}
          warnings={warnings}
          previewUrl={previewUrl}
          members={members.data ?? []}
          onPatchPlayer={patchPlayer}
          onPatchEnemy={patchEnemy}
          onOpponentName={(opponentName) => setDraft((d) => (d ? { ...d, opponentName } : d))}
          onSave={() => createMutation.mutate()}
          saving={createMutation.isPending}
          errorText={createMutation.isError ? errorMessage(createMutation.error, "No se pudo guardar la scrim.") : undefined}
        />
      ) : null}

      <UpgradeDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        quota={subscription.quota}
        reason="quota"
      />
    </div>
  );
}
