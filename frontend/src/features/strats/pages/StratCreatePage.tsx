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
    const canSubmit = !isPending;
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
                    <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-100">
                    Crear strat
                    </h1>

                    <Badge
                    variant="outline"
                    className="border-slate-700 bg-slate-950 text-slate-200"
                    >
                    Nueva
                    </Badge>
                </div>

                <p className="text-sm text-slate-400">
                    Subí una captura de la estrategia y agregá detalles.
                </p>
                </div>

                <Button
                variant="outline"
                className="border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-900"
                onClick={() => navigate("/app/strats")}
                >
                Cancelar
                </Button>
            </header>

            <Separator className="bg-slate-800" />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

                {/* Formulario */}
                <form onSubmit={onSubmit}>
                <Card className="border-slate-800 bg-slate-950/30">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-slate-200">
                    Información de la strat
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">

                    <div className="space-y-2">
                    <Label className="text-slate-200">
                        Nombre
                    </Label>

                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Split A default"
                        className="border-slate-800 bg-slate-950/40 text-slate-100"
                    />
                    </div>

                    <div className="space-y-2">
                    <Label className="text-slate-200">
                        Mapa
                    </Label>

                    <Input
                        value={map}
                        onChange={(e) => setMap(e.target.value)}
                        placeholder="Split"
                        className="border-slate-800 bg-slate-950/40 text-slate-100"
                    />
                    </div>

                    <div className="space-y-2">
                    <Label className="text-slate-200">
                        Side
                    </Label>

                    <select
                        value={side}
                        onChange={(e) => setSide(e.target.value as "ATTACK" | "DEFENSE")}
                        className="flex h-9 w-full rounded-md border border-slate-800 bg-slate-950/40 px-3 py-1 text-sm text-slate-100"
                    >
                        <option value="ATTACK">Attack</option>
                        <option value="DEFENSE">Defense</option>
                    </select>
                    </div>

                    <div className="space-y-2">
                    <Label className="text-slate-200">
                        Notas
                    </Label>

                    <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Explicación de la ejecución..."
                        className="min-h-[120px] border-slate-800 bg-slate-950/40 text-slate-100"
                    />
                    </div>

                    <div className="space-y-2">
                    <Label className="text-slate-200">
                        Screenshot
                    </Label>

                    <Input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        className="border-slate-800 bg-slate-950/40 text-slate-100 file:text-slate-200"
                    />

                    <p className="text-xs text-slate-500">
                        Subí una captura del mapa o setup de la estrategia.
                    </p>
                    </div>

                    {error && (
                    <div className="rounded-md border border-red-700/30 bg-red-600/10 px-3 py-2 text-sm text-red-200">
                        Error al crear la strat.
                    </div>
                    )}

                    <Button
                    className="w-full bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60"
                    disabled={!file || !name || !map || isPending}
                    type="submit"
                    >
                    {isPending ? "Subiendo..." : "Crear strat"}
                    </Button>

                </CardContent>
                </Card>
                </form>

                {/* Preview */}

                <Card className="border-slate-800 bg-slate-950/30">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-slate-200">
                    Vista previa
                    </CardTitle>
                </CardHeader>

                <CardContent>

                    {previewUrl ? (
                    <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950/40">
                        <img
                        src={previewUrl}
                        alt="preview"
                        className="block w-full"
                        />
                    </div>
                    ) : (
                    <div className="rounded-lg border border-dashed border-slate-800 bg-slate-950/20 p-6">
                        <p className="text-sm text-slate-400">
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