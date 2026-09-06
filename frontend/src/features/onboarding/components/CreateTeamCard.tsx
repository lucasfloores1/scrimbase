import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useCreateTeam from "../hooks/useCreateTeam";
import { Plus } from "lucide-react";

function errorToMessage(err: unknown): string {
  if (!err) return "";
  if (err instanceof Error) return err.message;
  return "Could not create team.";
}

export function CreateTeamCard() {
  const { create, isPending, error } = useCreateTeam();
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");

  function onSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    create({ name, tag });
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 space-y-5">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Plus className="h-4 w-4" />
          <span className="text-[11px] font-medium uppercase tracking-[0.16em]">Create</span>
        </div>
        <h2 className="font-display text-lg font-semibold tracking-tight">New team</h2>
        <p className="text-sm text-muted-foreground">Start a workspace and invite your roster.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Team name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Aconis"
            className="bg-background h-10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tag">Tag</Label>
          <Input
            id="tag"
            value={tag}
            onChange={(e) => setTag(e.target.value.toUpperCase())}
            placeholder="ACN"
            className="bg-background h-10"
          />
        </div>
        {error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {errorToMessage(error)}
          </div>
        ) : null}
        <Button type="submit" disabled={isPending || !name || !tag} className="w-full h-10">
          {isPending ? "Creating…" : "Create team"}
        </Button>
      </form>
    </div>
  );
}

export default CreateTeamCard;
