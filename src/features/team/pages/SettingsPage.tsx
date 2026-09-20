import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { usersApi } from "@/shared/api/users.api";
import type { UpdateMeDto } from "@/shared/types/dto";
import { errorMessage } from "@/shared/lib/format";
import { isRiotId } from "@/shared/lib/validation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/shared/ui/layout/PageHeader";
import { useSubscription } from "@/shared/hooks/useSubscription";
import { UpgradeDialog } from "@/features/billing/components/UpgradeDialog";
import { quotaSummary, timeUntil } from "@/shared/lib/quota";
import { FormMessage } from "@/shared/ui/feedback/FormMessage";
import { LoadingState } from "@/shared/ui/feedback/LoadingState";

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t py-8 first:border-t-0 first:pt-0 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <div>
        <h2 className="label">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className="max-w-md space-y-4">{children}</div>
    </section>
  );
}

export function SettingsPage() {
  const { user, isLoading, bootstrap, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [username, setUsername] = React.useState(user?.username ?? "");
  const [altAccountId, setAltAccountId] = React.useState(user?.altAccountId ?? "");
  const [profileError, setProfileError] = React.useState<string | null>(null);
  const [altError, setAltError] = React.useState<string | null>(null);
  const [password, setPassword] = React.useState("");
  const [passwordRepeat, setPasswordRepeat] = React.useState("");
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState<"profile" | "alt" | "password" | null>(null);
  const { subscription, enforced } = useSubscription();
  const [upgradeOpen, setUpgradeOpen] = React.useState(false);

  React.useEffect(() => {
    setUsername(user?.username ?? "");
    setAltAccountId(user?.altAccountId ?? "");
  }, [user?.username, user?.altAccountId]);

  const profileMutation = useMutation({
    mutationFn: (dto: UpdateMeDto) => usersApi.updateMe(dto),
    onSuccess: async () => {
      await bootstrap();
      await queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
      setSaved("profile");
    },
  });

  const altMutation = useMutation({
    mutationFn: (dto: UpdateMeDto) => usersApi.updateMe(dto),
    onSuccess: async () => {
      await bootstrap();
      await queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
      setSaved("alt");
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (dto: UpdateMeDto) => usersApi.updateMe(dto),
    onSuccess: () => {
      setPassword("");
      setPasswordRepeat("");
      setSaved("password");
    },
  });

  if (isLoading) return <LoadingState variant="page" rows={3} />;
  if (!user) return null;

  const profileDirty = username.trim() !== (user.username ?? "");
  const altDirty = altAccountId.trim() !== (user.altAccountId ?? "");

  function submitProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaved(null);
    const next = username.trim();
    if (next.length < 3) {
      setProfileError("El nombre de usuario necesita al menos 3 caracteres.");
      return;
    }
    setProfileError(null);
    profileMutation.mutate({ username: next });
  }

  function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setSaved(null);
    if (password.length < 6) {
      setPasswordError("La contraseña nueva necesita al menos 6 caracteres.");
      return;
    }
    if (password !== passwordRepeat) {
      setPasswordError("Las dos contraseñas no coinciden.");
      return;
    }
    setPasswordError(null);
    passwordMutation.mutate({ password });
  }

  function submitAlt(e: React.FormEvent) {
    e.preventDefault();
    setSaved(null);
    const next = altAccountId.trim();
    if (next && !isRiotId(next)) {
      setAltError("Usá el formato Nombre#TAG, igual que en el juego (tag de 3 a 5 caracteres).");
      return;
    }
    setAltError(null);
    altMutation.mutate({ altAccountId: next });
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Configuración" description="Tu cuenta en Scrimbase." />

      <div>
        <Section title="Perfil" description="Así te ven los demás en el equipo y en los scoreboards.">
          <form onSubmit={submitProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="riotId">Riot ID</Label>
              <Input id="riotId" value={user.riotId ?? ""} placeholder="Sin configurar" disabled />
              <p className="text-xs text-muted-foreground">Es el que usás para reconocerte en las capturas. Se define al registrarte.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de usuario</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
            </div>

            {profileError || profileMutation.isError ? (
              <FormMessage kind="error">{profileError ?? errorMessage(profileMutation.error)}</FormMessage>
            ) : null}
            {saved === "profile" ? <FormMessage kind="success">Perfil guardado.</FormMessage> : null}

            <div className="flex justify-end">
              <Button type="submit" disabled={!profileDirty || profileMutation.isPending}>
                {profileMutation.isPending ? "Guardando…" : "Guardar perfil"}
              </Button>
            </div>
          </form>
        </Section>

        <Section
          title="Cuenta alternativa"
          description="Si jugás scrims con otra cuenta (por ejemplo en otra región), agregala para que la IA también te reconozca."
        >
          <form onSubmit={submitAlt} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alt">Riot ID alternativo</Label>
              <Input
                id="alt"
                value={altAccountId}
                onChange={(e) => setAltAccountId(e.target.value)}
                placeholder="Nombre#TAG"
                autoComplete="off"
              />
            </div>

            {altError || altMutation.isError ? (
              <FormMessage kind="error">{altError ?? errorMessage(altMutation.error)}</FormMessage>
            ) : null}
            {saved === "alt" ? <FormMessage kind="success">Cuenta alternativa guardada.</FormMessage> : null}

            <div className="flex justify-end">
              <Button type="submit" disabled={!altDirty || altMutation.isPending}>
                {altMutation.isPending ? "Guardando…" : "Guardar cuenta alternativa"}
              </Button>
            </div>
          </form>
        </Section>

        {enforced ? (
          <Section title="Plan" description="El plan es del equipo: lo comparten todos los integrantes.">
            <div className="surface p-5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-display text-lg font-semibold">
                  {subscription.plan === "PRO" ? "Pro" : "Gratis"}
                </span>
                {subscription.status !== "ACTIVE" ? (
                  <span className="text-xs text-loss">
                    {subscription.status === "PAST_DUE" ? "Pago pendiente" : "Cancelado"}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {subscription.quota.limit === null
                  ? "Scrims ilimitadas."
                  : `${quotaSummary(subscription.quota)}. Se renueva ${timeUntil(subscription.quota.resetsAt) ?? "pronto"}.`}
              </p>
              {subscription.currentPeriodEnd && subscription.plan === "PRO" ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Período actual hasta {new Date(subscription.currentPeriodEnd).toLocaleDateString("es-AR")}.
                </p>
              ) : null}
            </div>
            {subscription.plan !== "PRO" ? (
              user.teamMember?.isAdmin ? (
                <div className="flex justify-end">
                  <Button className="bg-plasma border-0 text-white hover:opacity-90" onClick={() => setUpgradeOpen(true)}>
                    Pasar a Pro
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  El plan lo cambia un admin del equipo.
                </p>
              )
            ) : null}
          </Section>
        ) : null}

        <Section title="Contraseña" description="Elegí una nueva. La sesión actual sigue abierta.">
          <form onSubmit={submitPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Contraseña nueva</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password-repeat">Repetir contraseña</Label>
              <Input
                id="new-password-repeat"
                type="password"
                autoComplete="new-password"
                value={passwordRepeat}
                onChange={(e) => setPasswordRepeat(e.target.value)}
                aria-invalid={passwordRepeat.length > 0 && passwordRepeat !== password}
              />
            </div>

            {passwordError || passwordMutation.isError ? (
              <FormMessage kind="error">{passwordError ?? errorMessage(passwordMutation.error)}</FormMessage>
            ) : null}
            {saved === "password" ? <FormMessage kind="success">Contraseña actualizada.</FormMessage> : null}

            <div className="flex justify-end">
              <Button type="submit" disabled={!password || !passwordRepeat || passwordMutation.isPending}>
                {passwordMutation.isPending ? "Guardando…" : "Cambiar contraseña"}
              </Button>
            </div>
          </form>
        </Section>

        <Section title="Sesión" description="Cerrar sesión en este dispositivo.">
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                logout();
                navigate("/login", { replace: true });
              }}
            >
              Cerrar sesión
            </Button>
          </div>
        </Section>
      </div>

      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} quota={subscription.quota} />
    </div>
  );
}

export default SettingsPage;
