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
        <h1 className="text-lg font-semibold text-foreground">Iniciar sesión</h1>
        <p className="text-sm text-muted-foreground">
          Entrá para ver tu equipo, scrims y dashboard.
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
          placeholder="scrimbase@email.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground">
          Contraseña
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="placeholder:text-muted-foreground"
          placeholder="••••••••"
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
        {isPending ? "Ingresando..." : "Ingresar"}
      </Button>

      <p className="text-sm text-muted-foreground">
        ¿No tenés cuenta?{" "}
        <Link className="text-brand hover:underline" to="/register">
          Crear cuenta
        </Link>
      </p>
    </form>
  );
}

export default LoginForm;