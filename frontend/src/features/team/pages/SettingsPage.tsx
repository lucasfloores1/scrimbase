import * as React from "react";
import { useMutation } from "@tanstack/react-query";

import { useAuth } from "@/app/providers/AuthProvider";
import { usersApi } from "@/shared/api/users.api";
import type { UpdateMeDto } from "@/shared/types/dto";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { LoadingState } from "@/shared/ui/feedback/LoadingState";

function isRiotIdLike(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  const parts = v.split("#");
  if (parts.length !== 2) return false;
  const [name, tag] = parts;
  return name.trim().length >= 3 && tag.trim().length >= 2;
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Ocurrió un error.";
}

export function SettingsPage() {
  const { user, isLoading, bootstrap, logout } = useAuth();

  const [username, setUsername] = React.useState<string>(user?.username ?? "");
  const [altAccountId, setAltAccountId] = React.useState<string>(user?.altAccountId ?? "");

  const [clientError, setClientError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    setUsername(user?.username ?? "");
    setAltAccountId(user?.altAccountId ?? "");
  }, [user?.username, user?.altAccountId]);

  const updateMeMutation = useMutation({
    mutationFn: async (dto: UpdateMeDto) => usersApi.updateMe(dto),
    onSuccess: async () => {
      await bootstrap();
      setSuccess("Cambios guardados.");
      setClientError(null);
    },
  });

  if (isLoading) {
    return <LoadingState title="Cargando settings" description="Preparando tu configuración..." />;
  }

  if (!user) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-slate-100">Settings</h1>
        <p className="text-sm text-slate-400">Necesitás iniciar sesión.</p>
      </div>
    );
  }

  const email = user.email;
  const riotId = user.riotId ?? "";
  const isSaving = updateMeMutation.isPending;

  function submitAlt(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(null);

    const value = altAccountId.trim();
    if (!value) {
      setClientError('Ingresá un Riot ID válido (ej: player#TAG).');
      return;
    }
    if (!isRiotIdLike(value)) {
      setClientError("Formato inválido. Usá: gameUsername#TAG");
      return;
    }

    updateMeMutation.mutate({ altAccountId: value });
  }

  function submitProfile(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(null);

    const next = username.trim();
    if (next.length < 3) {
      setClientError("El username debe tener al menos 3 caracteres.");
      return;
    }

    updateMeMutation.mutate({ username: next });
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-100">
          Settings
        </h1>
        <p className="text-sm text-slate-400">Configuración de cuenta y preferencias.</p>
      </header>

      <Separator className="bg-slate-800" />

      {(clientError || updateMeMutation.isError) ? (
        <div className="rounded-lg border border-red-900/40 bg-red-950/30 p-3 text-sm text-red-200">
          {clientError ?? errorMessage(updateMeMutation.error)}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/25 p-3 text-sm text-emerald-200">
          {success}
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-4">
        {/* Cuenta */}
        <Card className="border-slate-800 bg-slate-950/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-200">Cuenta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-slate-300">Email</Label>
                <Input
                  value={email}
                  disabled
                  className="border-slate-800 bg-slate-950 text-slate-200 disabled:opacity-70"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-slate-300">Riot ID (principal)</Label>
                <Input
                  value={riotId || "(no configurado)"}
                  disabled
                  className="border-slate-800 bg-slate-950 text-slate-200 disabled:opacity-70"
                />
              </div>
            </div>

            <form onSubmit={submitProfile} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-slate-300">Username</Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="border-slate-800 bg-slate-950 text-slate-200 placeholder:text-slate-600"
                  placeholder="Tu nombre en Scrimbase"
                />
                <p className="text-xs text-slate-500">
                  Visible dentro de tu equipo y en el dashboard.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-blue-600 text-white hover:bg-blue-500"
                >
                  Guardar perfil
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Cuenta alternativa */}
        <Card className="border-slate-800 bg-slate-950/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-200">Cuenta alternativa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label className="text-slate-300">Alt Riot ID</Label>
              <Input
                value={altAccountId}
                onChange={(e) => setAltAccountId(e.target.value)}
                className="border-slate-800 bg-slate-950 text-slate-200 placeholder:text-slate-600"
                placeholder="Ej: altPlayer#EUW"
              />
              <p className="text-xs text-slate-500">
                Si tu equipo juega scrims en otra región con otra cuenta, agregala acá.
                Esto ayuda a matchear los nombres detectados por la IA con tu usuario.
              </p>
            </div>

            <form onSubmit={submitAlt} className="flex items-center justify-end gap-2">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-blue-600 text-white hover:bg-blue-500"
              >
                Guardar cuenta alternativa
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sesión */}
        <Card className="border-slate-800 bg-slate-950/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-200">Sesión</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm text-slate-200">Cerrar sesión</div>
              <div className="text-xs text-slate-500">Se borrarán tus tokens locales.</div>
            </div>
            <Button
              variant="outline"
              className="border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-900"
              onClick={logout}
            >
              Logout
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default SettingsPage;