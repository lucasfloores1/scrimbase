import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import useJoin from "../hooks/useJoin";
import { Users } from "lucide-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@base-ui/react";
import { Button } from "@/components/ui/button";

function errorToMessage(err: unknown): string {
    if (!err) return "";
    if (err instanceof Error) return err.message;
    return "No se pudo unirse al equipo.";
}

export function JoinTeamCard() {
    const { join, isPending, error } = useJoin();
    
    const [inviteCode, setInviteCode] = useState("");

    const canSubmit = !isPending;

    function onSubmit(e: React.SubmitEvent){
        e.preventDefault();
        join({ inviteCode: inviteCode })
    }
    return (
        <Card className="border shadow-lg">

  <CardHeader className="space-y-2">

    <div className="flex items-center gap-2">
      <Users className="h-5 w-5 text-brand" />

      <CardTitle className="text-lg text-foreground">
        Unirse a un equipo
      </CardTitle>
    </div>

    <CardDescription className="text-muted-foreground">
      Ingresá un código de invitación para acceder al equipo.
    </CardDescription>

  </CardHeader>

  <CardContent>

    <form onSubmit={onSubmit} className="space-y-4">

      <div className="space-y-2">
        <Label htmlFor="inviteCode" className="text-foreground">
          Código de invitación
        </Label>

        <Input
          id="inviteCode"
          type="text"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="8f0XFGODBoup"
          className="placeholder:text-muted-foreground"
        />
      </div>

      {error && (
        <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {errorToMessage(error)}
        </div>
      )}

      <Button
        type="submit"
        disabled={!canSubmit}
        className="w-full bg-brand text-brand-foreground hover:bg-brand-hover disabled:opacity-60"
      >
        {isPending ? "Uniéndose..." : "Unirse"}
      </Button>

    </form>

  </CardContent>

</Card>
    );
}

export default JoinTeamCard;