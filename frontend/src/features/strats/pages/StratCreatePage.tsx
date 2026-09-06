import { useEffect, useRef, useState } from "react";
import { useCreateStrat } from "../hooks/useCreateStrat";
import type { CreateStratDto } from "@/shared/types/dto";
import { useAuth } from "@/app/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { PageHeader } from "@/shared/ui/PageHeader";
import { useNavigate } from "react-router-dom";
import { ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { VALORANT_MAPS, type ValorantMap } from "@/shared/constants/valorant";

export function StratCreatePage() {
  const { user } = useAuth();
  const teamId = user!.teamMember!.teamId;
  const { create, isPending, error } = useCreateStrat();
  const [name, setName] = useState("");
  const [map, setMap] = useState<ValorantMap>(VALORANT_MAPS[0]);
  const [side, setSide] = useState<"ATTACK" | "DEFENSE">("ATTACK");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function onSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!file) return;
    const dto: CreateStratDto = { name, map, side, notes };
    create({ file, dto, teamId });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Strats"
        title="New strat"
        description="Save a setup with a clear visual reference."
        actions={
          <Button variant="outline" onClick={() => navigate("/app/strats")}>
            Cancel
          </Button>
        }
      />

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5 space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="A default execute"
              className="bg-surface h-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Map</Label>
              <Select value={map} onValueChange={(v) => setMap(v as ValorantMap)}>
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
            <div className="space-y-2">
              <Label>Side</Label>
              <Select value={side} onValueChange={(v) => setSide(v as "ATTACK" | "DEFENSE")}>
                <SelectTrigger className="bg-surface w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ATTACK">Attack</SelectItem>
                  <SelectItem value="DEFENSE">Defense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Timing, utility order, roles…"
              className="min-h-[120px] bg-surface"
            />
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed px-4 py-8 transition-colors",
              "bg-surface hover:bg-muted/40",
              file ? "border-ink/20" : "border-border",
            )}
          >
            <ImagePlus className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">{file ? file.name : "Add screenshot"}</span>
          </button>

          {error ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              Could not create strat.
            </div>
          ) : null}

          <Button type="submit" className="w-full h-10" disabled={!file || !name || isPending}>
            {isPending ? "Saving…" : "Save strat"}
          </Button>
        </div>

        <div className="lg:col-span-7">
          <div className="overflow-hidden rounded-2xl border border-border bg-ink min-h-[320px]">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="block w-full object-contain" />
            ) : (
              <div className="scrim-grid flex min-h-[320px] items-center justify-center px-6">
                <p className="text-sm text-white/40">Preview appears here</p>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default StratCreatePage;
