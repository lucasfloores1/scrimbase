import { useEffect, useState } from "react";
import { useCreateStrat } from "../hooks/useCreateStrat";
import type { CreateStratDto } from "@/shared/types/dto";
import { useAuth } from "@/app/providers/AuthProvider";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export function StratCreatePage() {
    const { user } = useAuth();
    const teamId =  user!.teamMember!.teamId;
    const { create, isPending, error } = useCreateStrat();
    const [name, setName] = useState("");
    const [map, setMap] = useState("");
    const [side, setSide] = useState<"ATTACK" | "DEFENSE">("ATTACK");
    const [notes, setNotes] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

    function onSubmit(e : React.SubmitEvent){
        e.preventDefault();
        if (!file) return
        const dto : CreateStratDto = {
            name,
            map,
            side,
            notes,
        }
        create({ file, dto, teamId });

    }
    return (
        <div className="space-y-6">

            {/* Header */}

            <header className="flex items-center justify-between">
                <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">
                    Crear strat
                    </h1>

                    <Badge
                    variant="outline"
                    className="border-border bg-background text-foreground"
                    >
                    Nueva
                    </Badge>
                </div>

                <p className="text-sm text-muted-foreground">
                    Subí una captura de la estrategia y agregá detalles.
                </p>
                </div>

                <Button
                variant="outline"
                onClick={() => navigate("/app/strats")}
                >
                Cancelar
                </Button>
            </header>

            <Separator className="bg-accent" />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

                {/* Formulario */}
                <form onSubmit={onSubmit}>
                <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-foreground">
                    Información de la strat
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">

                    <div className="space-y-2">
                    <Label className="text-foreground">
                        Nombre
                    </Label>

                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Split A default"
                    />
                    </div>

                    <div className="space-y-2">
                    <Label className="text-foreground">
                        Mapa
                    </Label>

                    <Input
                        value={map}
                        onChange={(e) => setMap(e.target.value)}
                        placeholder="Split"
                    />
                    </div>

                    <div className="space-y-2">
                    <Label className="text-foreground">
                        Side
                    </Label>

                    <select
                        value={side}
                        onChange={(e) => setSide(e.target.value as "ATTACK" | "DEFENSE")}
                        className="flex h-9 w-full rounded-md border px-3 py-1 text-sm text-foreground"
                    >
                        <option value="ATTACK">Attack</option>
                        <option value="DEFENSE">Defense</option>
                    </select>
                    </div>

                    <div className="space-y-2">
                    <Label className="text-foreground">
                        Notas
                    </Label>

                    <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Explicación de la ejecución..."
                        className="min-h-[120px]"
                    />
                    </div>

                    <div className="space-y-2">
                    <Label className="text-foreground">
                        Screenshot
                    </Label>

                    <Input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        className="file:text-foreground"
                    />

                    <p className="text-xs text-muted-foreground">
                        Subí una captura del mapa o setup de la estrategia.
                    </p>
                    </div>

                    {error && (
                    <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                        Error al crear la strat.
                    </div>
                    )}

                    <Button
                    className="w-full bg-brand text-brand-foreground hover:bg-brand-hover disabled:opacity-60"
                    disabled={!file || !name || !map || isPending}
                    type="submit"
                    >
                    {isPending ? "Subiendo..." : "Crear strat"}
                    </Button>

                </CardContent>
                </Card>
                </form>

                {/* Preview */}

                <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-foreground">
                    Vista previa
                    </CardTitle>
                </CardHeader>

                <CardContent>

                    {previewUrl ? (
                    <div className="overflow-hidden rounded-lg border">
                        <img
                        src={previewUrl}
                        alt="preview"
                        className="block w-full"
                        />
                    </div>
                    ) : (
                    <div className="rounded-lg border border-dashed border-border bg-card/30 p-6">
                        <p className="text-sm text-muted-foreground">
                        Seleccioná una captura para ver la vista previa.
                        </p>
                    </div>
                    )}

                </CardContent>
                </Card>

            </div>
        </div>
    )
}

export default StratCreatePage;