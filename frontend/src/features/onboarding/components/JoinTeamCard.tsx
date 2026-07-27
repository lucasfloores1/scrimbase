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
        <Card className="border border-slate-800 bg-slate-950/40 shadow-lg">

  <CardHeader className="space-y-2">

    <div className="flex items-center gap-2">
      <Users className="h-5 w-5 text-blue-400" />

      <CardTitle className="text-lg text-slate-100">
        Unirse a un equipo
      </CardTitle>
    </div>

    <CardDescription className="text-slate-400">
      Ingresá un código de invitación para acceder al equipo.
    </CardDescription>

  </CardHeader>

  <CardContent>

    <form onSubmit={onSubmit} className="space-y-4">

      <div className="space-y-2">
        <Label htmlFor="inviteCode" className="text-slate-200">
          Código de invitación
        </Label>

        <Input
          id="inviteCode"
          type="text"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="8f0XFGODBoup"
          className="border-slate-800 bg-slate-950/40 text-slate-100 placeholder:text-slate-500"
        />
      </div>

      {error && (
        <div className="rounded-md border border-red-700/30 bg-red-600/10 px-3 py-2 text-sm text-red-200">
          {errorToMessage(error)}
        </div>
      )}

      <Button
        type="submit"
        disabled={!canSubmit}
        className="w-full bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60"
      >
        {isPending ? "Uniéndose..." : "Unirse"}
      </Button>

    </form>

  </CardContent>

</Card>
    );
}

export default JoinTeamCard;