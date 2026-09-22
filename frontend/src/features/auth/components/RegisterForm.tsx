import * as React from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useRegister } from "@/features/auth/hooks/useRegister";

function errorToMessage(err: unknown): string {
  if (!err) return "";
  if (err instanceof Error) return err.message;
  return "No se pudo crear la cuenta.";
}

function looksLikeRiotId(value: string) {
  // backend validates "gameUsername#TAG"
  return value.includes("#") && value.split("#")[0].trim().length > 0 && value.split("#")[1].trim().length > 0;
}

export function RegisterForm() {
  const { register, isPending, error } = useRegister();

  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [riotId, setRiotId] = React.useState("");
  const [password, setPassword] = React.useState("");

  const canSubmit =
    email.trim().length > 0 &&
    username.trim().length > 0 &&
    looksLikeRiotId(riotId.trim()) &&
    password.length >= 6 &&
    !isPending;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    register({
      email: email.trim(),
      username: username.trim(),
      riotId: riotId.trim(),
      password,
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-foreground">Crear cuenta</h1>
        <p className="text-sm text-muted-foreground">
          Configurá tu perfil para empezar en Scrimbase.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="placeholder:text-muted-foreground"
          placeholder="tu@email.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username" className="text-foreground">
          Nombre de usuario
        </Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="placeholder:text-muted-foreground"
          placeholder="Tu nombre público"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="riotId" className="text-foreground">
          Riot ID
        </Label>
        <Input
          id="riotId"
          value={riotId}
          onChange={(e) => setRiotId(e.target.value)}
          className="placeholder:text-muted-foreground"
          placeholder="MiNick#TAG"
        />
        <p className="text-xs text-muted-foreground">Formato requerido: gameUsername#TAG</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground">
          Contraseña
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="placeholder:text-muted-foreground"
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      {error ? (
        <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {errorToMessage(error)}
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={!canSubmit}
        className="w-full bg-brand text-brand-foreground hover:bg-brand-hover disabled:opacity-60"
      >
        {isPending ? "Creando cuenta..." : "Crear cuenta"}
      </Button>

      <p className="text-sm text-muted-foreground">
        ¿Ya tenés cuenta?{" "}
        <Link className="text-brand hover:underline" to="/login">
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
}

export default RegisterForm;