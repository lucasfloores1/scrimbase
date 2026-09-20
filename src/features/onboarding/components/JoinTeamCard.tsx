import { useState } from "react";
import { Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/shared/ui/feedback/FormMessage";
import { errorMessage } from "@/shared/lib/format";
import useJoin from "../hooks/useJoin";

export function JoinTeamCard() {
  const { join, isPending, error } = useJoin();
  const [inviteCode, setInviteCode] = useState("");

  const canSubmit = inviteCode.trim().length > 0 && !isPending;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    join({ inviteCode: inviteCode.trim() });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="size-5 text-primary" />
          <CardTitle className="text-base font-semibold">Unirme a un equipo</CardTitle>
        </div>
        <CardDescription>Pedile el código de invitación al admin de tu equipo.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-code">Código de invitación</Label>
            <Input
              id="invite-code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="8f0XFGODBoup"
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          {error ? <FormMessage kind="error">{errorMessage(error, "No se pudo unir al equipo. Revisá el código.")}</FormMessage> : null}

          <Button type="submit" disabled={!canSubmit} className="w-full">
            {isPending ? "Uniéndote…" : "Unirme"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default JoinTeamCard;
