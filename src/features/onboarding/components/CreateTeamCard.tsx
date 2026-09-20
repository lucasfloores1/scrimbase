import { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/shared/ui/feedback/FormMessage";
import { errorMessage } from "@/shared/lib/format";
import { TEAM_NAME, TEAM_TAG } from "@/shared/lib/validation";
import useCreateTeam from "../hooks/useCreateTeam";

export function CreateTeamCard() {
  const { create, isPending, error } = useCreateTeam();
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");

  const cleanName = name.trim();
  const cleanTag = tag.trim().replace(/^#/, "");
  const canSubmit =
    cleanName.length >= TEAM_NAME.min &&
    cleanName.length <= TEAM_NAME.max &&
    cleanTag.length >= TEAM_TAG.min &&
    cleanTag.length <= TEAM_TAG.max &&
    !isPending;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    create({ name: cleanName, tag: cleanTag });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Plus className="size-5 text-primary" />
          <CardTitle className="text-base font-semibold">Crear un equipo</CardTitle>
        </div>
        <CardDescription>Vos quedás como admin y recibís un código para invitar al resto.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="team-name">Nombre del equipo</Label>
            <Input
              id="team-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rosario Esports"
              maxLength={TEAM_NAME.max}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team-tag">Tag</Label>
            <Input
              id="team-tag"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="ROS"
              maxLength={TEAM_TAG.max}
            />
            <p className="text-xs text-muted-foreground">
              Entre {TEAM_TAG.min} y {TEAM_TAG.max} caracteres. Aparece junto al nombre en todo el sitio.
            </p>
          </div>

          {error ? <FormMessage kind="error">{errorMessage(error, "No se pudo crear el equipo.")}</FormMessage> : null}

          <Button type="submit" disabled={!canSubmit} className="w-full">
            {isPending ? "Creando…" : "Crear equipo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default CreateTeamCard;
