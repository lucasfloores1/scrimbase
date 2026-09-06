import type { ScrimType } from "@/shared/types/dto";
import type { ValorantMap } from "@/shared/constants/valorant";
import { VALORANT_MAPS } from "@/shared/constants/valorant";
import { ScreenshotPreview } from "@/shared/ui/ScreenshotPreview";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ImagePlus, Loader2, Sparkles } from "lucide-react";
import { useRef } from "react";

const TYPES: Array<{ value: ScrimType; label: string }> = [
  { value: "SCRIM", label: "Scrim" },
  { value: "PREMIER", label: "Premier" },
  { value: "TOURNAMENT", label: "Tournament" },
];

type Props = {
  type: ScrimType;
  map: ValorantMap;
  file: File | null;
  previewUrl: string | null;
  isParsing: boolean;
  error?: string | null;
  onTypeChange: (v: ScrimType) => void;
  onMapChange: (v: ValorantMap) => void;
  onFileChange: (f: File | null) => void;
  onAnalyze: () => void;
  onManualDraft: () => void;
};

export function ScrimUploadStep({
  type,
  map,
  file,
  previewUrl,
  isParsing,
  error,
  onTypeChange,
  onMapChange,
  onFileChange,
  onAnalyze,
  onManualDraft,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-rise">
      <div className="space-y-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Step 1
        </p>
        <h2 className="font-display text-xl font-semibold tracking-tight">Upload scoreboard</h2>
        <p className="text-sm text-muted-foreground">
          Drop a clear post-match screenshot. We extract rounds, agents and player stats.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />

      {previewUrl ? (
        <div className="space-y-2">
          <ScreenshotPreview src={previewUrl} />
          <div className="flex items-center justify-between gap-3 px-0.5">
            <p className="truncate text-xs text-muted-foreground">{file?.name}</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0"
              onClick={() => inputRef.current?.click()}
            >
              Change image
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "group relative flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center transition-all sm:py-20",
            "bg-surface hover:border-ink/30 hover:bg-muted/40 border-border",
          )}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-foreground transition-transform group-hover:scale-105">
            <ImagePlus className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-medium">Choose screenshot</p>
            <p className="text-xs text-muted-foreground">PNG, JPG or WebP · up to 8MB</p>
          </div>
        </button>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={type} onValueChange={(v) => onTypeChange(v as ScrimType)}>
            <SelectTrigger className="bg-surface w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Map</Label>
          <Select value={map} onValueChange={onMapChange}>
            <SelectTrigger className="bg-surface w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VALORANT_MAPS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <Button
          size="lg"
          className="w-full gap-2"
          disabled={!file || isParsing}
          onClick={onAnalyze}
        >
          {isParsing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Analyze with AI
            </>
          )}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onManualDraft}>
          Skip AI · enter stats manually
        </Button>
      </div>
    </div>
  );
}
