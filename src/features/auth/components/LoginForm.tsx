import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/shared/ui/feedback/FormMessage";
import { errorMessage } from "@/shared/lib/format";
import { useLogin } from "@/features/auth/hooks/useLogin";

export function LoginForm() {
  const { login, isPending, error } = useLogin();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isPending;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    login({ email: email.trim(), password });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-medium tracking-[0.04em] uppercase">Iniciar sesión</h1>
        <p className="text-sm text-muted-foreground">Entrá para ver tu equipo, scrims y strats.</p>
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
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </div>

      {error ? <FormMessage kind="error">{errorMessage(error, "No se pudo iniciar sesión.")}</FormMessage> : null}

      <Button type="submit" size="lg" disabled={!canSubmit} className="w-full">
        {isPending ? "Ingresando…" : "Ingresar"}
      </Button>

      <p className="text-sm text-muted-foreground">
        ¿No tenés cuenta?{" "}
        <Link className="font-medium text-foreground underline-offset-4 hover:underline" to="/register">
          Crear cuenta
        </Link>
      </p>
    </form>
  );
}

export default LoginForm;
