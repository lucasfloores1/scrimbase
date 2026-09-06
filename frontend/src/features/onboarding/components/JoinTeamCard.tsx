import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useJoin from "../hooks/useJoin";
import { Users } from "lucide-react";

function errorToMessage(err: unknown): string {
  if (!err) return "";
  if (err instanceof Error) return err.message;
  return "Could not join team.";
}

export function JoinTeamCard() {
  const { join, isPending, error } = useJoin();
  const [inviteCode, setInviteCode] = useState("");

  function onSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    join({ inviteCode });
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 space-y-5">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span className="text-[11px] font-medium uppercase tracking-[0.16em]">Join</span>
        </div>
        <h2 className="font-display text-lg font-semibold tracking-tight">Existing team</h2>
        <p className="text-sm text-muted-foreground">Enter an invite code from your captain.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="inviteCode">Invite code</Label>
          <Input
            id="inviteCode"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="8f0XFGODBoup"
            className="bg-background h-10 font-mono text-sm"
          />
        </div>
        {error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {errorToMessage(error)}
          </div>
        ) : null}
        <Button type="submit" disabled={isPending || !inviteCode} className="w-full h-10" variant="outline">
          {isPending ? "Joining…" : "Join team"}
        </Button>
      </form>
    </div>
  );
}

export default JoinTeamCard;
