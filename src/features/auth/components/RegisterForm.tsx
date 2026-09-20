import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/shared/ui/feedback/FormMessage";
import { errorMessage } from "@/shared/lib/format";
import { useRegister } from "@/features/auth/hooks/useRegister";
import { isRiotId } from "@/shared/lib/validation";

export function RegisterForm() {
  const { register, isPending, error } = useRegister();

  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [riotId, setRiotId] = React.useState("");
  const [password, setPassword] = React.useState("");

  const riotIdTouched = riotId.length > 0;
  const riotIdValid = isRiotId(riotId.trim());

  const canSubmit =
    email.trim().length > 0 &&
    username.trim().length >= 3 &&
    riotIdValid &&
    password.length >= 6 &&
    !isPending;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    register({ email: email.trim(), username: username.trim(), riotId: riotId.trim(), password });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-medium tracking-[0.04em] uppercase">Crear cuenta</h1>
        <p className="text-sm text-muted-foreground">Después vas a poder crear un equipo o unirte a uno.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vos@equipo.gg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Nombre de usuario</Label>
        <Input
          id="username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Cómo te ve tu equipo"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="riotId">Riot ID</Label>
        <Input
          id="riotId"
          value={riotId}
          onChange={(e) => setRiotId(e.target.value)}
          placeholder="Nombre#TAG"
          aria-invalid={riotIdTouched && !riotIdValid}
        />
        <p className="text-xs text-muted-foreground">
          Con el mismo formato que en el juego: <span className="text-foreground">Nombre#TAG</span> (tag de 3 a 5
          caracteres). Sirve para reconocerte en las capturas.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      {error ? <FormMessage kind="error">{errorMessage(error, "No se pudo crear la cuenta.")}</FormMessage> : null}

      <Button type="submit" size="lg" disabled={!canSubmit} className="w-full">
        {isPending ? "Creando cuenta…" : "Crear cuenta"}
      </Button>

      <p className="text-sm text-muted-foreground">
        ¿Ya tenés cuenta?{" "}
        <Link className="font-medium text-foreground underline-offset-4 hover:underline" to="/login">
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
}

export default RegisterForm;
