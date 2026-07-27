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
        <h1 className="text-lg font-semibold text-slate-100">Crear cuenta</h1>
        <p className="text-sm text-slate-400">
          Configurá tu perfil para empezar en Scrimbase.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-slate-200">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-slate-800 bg-slate-950/40 text-slate-100 placeholder:text-slate-500"
          placeholder="tu@email.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username" className="text-slate-200">
          Nombre de usuario
        </Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border-slate-800 bg-slate-950/40 text-slate-100 placeholder:text-slate-500"
          placeholder="Tu nombre público"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="riotId" className="text-slate-200">
          Riot ID
        </Label>
        <Input
          id="riotId"
          value={riotId}
          onChange={(e) => setRiotId(e.target.value)}
          className="border-slate-800 bg-slate-950/40 text-slate-100 placeholder:text-slate-500"
          placeholder="MiNick#TAG"
        />
        <p className="text-xs text-slate-500">Formato requerido: gameUsername#TAG</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-slate-200">
          Contraseña
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border-slate-800 bg-slate-950/40 text-slate-100 placeholder:text-slate-500"
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      {error ? (
        <div className="rounded-md border border-red-700/30 bg-red-600/10 px-3 py-2 text-sm text-red-200">
          {errorToMessage(error)}
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={!canSubmit}
        className="w-full bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60"
      >
        {isPending ? "Creando cuenta..." : "Crear cuenta"}
      </Button>

      <p className="text-sm text-slate-400">
        ¿Ya tenés cuenta?{" "}
        <Link className="text-blue-300 hover:text-blue-200" to="/login">
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
}

export default RegisterForm;