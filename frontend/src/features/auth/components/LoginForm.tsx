import * as React from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useLogin } from "@/features/auth/hooks/useLogin";

function errorToMessage(err: unknown): string {
  if (!err) return "";
  if (err instanceof Error) return err.message;
  return "No se pudo iniciar sesión.";
}

export function LoginForm() {
  const { login, isPending, error } = useLogin();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isPending;

  function onSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    login({ email: email.trim(), password });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-slate-100">Iniciar sesión</h1>
        <p className="text-sm text-slate-400">
          Entrá para ver tu equipo, scrims y dashboard.
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
          placeholder="scrimbase@email.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-slate-200">
          Contraseña
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border-slate-800 bg-slate-950/40 text-slate-100 placeholder:text-slate-500"
          placeholder="••••••••"
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
        {isPending ? "Ingresando..." : "Ingresar"}
      </Button>

      <p className="text-sm text-slate-400">
        ¿No tenés cuenta?{" "}
        <Link className="text-blue-300 hover:text-blue-200" to="/register">
          Crear cuenta
        </Link>
      </p>
    </form>
  );
}

export default LoginForm;