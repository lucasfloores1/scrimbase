import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@base-ui/react";
import { Button } from "@/components/ui/button";
import useCreateTeam from "../hooks/useCreateTeam";

function errorToMessage(err: unknown): string {
    if (!err) return "";
    if (err instanceof Error) return err.message;
    return "No se pudo unirse al equipo.";
}

export function CreateTeamCard() {
    const { create, isPending, error } = useCreateTeam();
    
    const [name, setName] = useState("");
    const [tag, setTag] = useState("");

    const canSubmit = !isPending;

    function onSubmit(e: React.SubmitEvent){
        e.preventDefault();
        create({ name: name, tag: tag })
    }
    return (
        <Card className="border shadow-lg">

  <CardHeader className="space-y-2">

    <div className="flex items-center gap-2">
      <Plus className="h-5 w-5 text-brand" />

      <CardTitle className="text-lg text-foreground">
        Crear un equipo
      </CardTitle>
    </div>

    <CardDescription className="text-muted-foreground">
      Creá un nuevo equipo e invitá a tus compañeros.
    </CardDescription>

  </CardHeader>

  <CardContent>

    <form onSubmit={onSubmit} className="space-y-4">

      <div className="space-y-2">
        <Label htmlFor="name" className="text-foreground">
          Nombre del equipo
        </Label>

        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Scrimbase Team"
          className="placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tag" className="text-foreground">
          TAG del equipo
        </Label>

        <Input
          id="tag"
          type="text"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="#SCRIM"
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
        {isPending ? "Creando..." : "Crear equipo"}
      </Button>

    </form>

  </CardContent>

</Card>
    );
}

export default CreateTeamCard;