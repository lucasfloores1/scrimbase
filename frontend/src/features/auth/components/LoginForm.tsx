import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/features/auth/hooks/useLogin";

function errorToMessage(err: unknown): string {
  if (!err) return "";
  if (err instanceof Error) return err.message;
  return "Could not sign in.";
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
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to your team workspace.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@team.com"
          className="bg-surface h-10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="bg-surface h-10"
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {errorToMessage(error)}
        </div>
      ) : null}

      <Button type="submit" disabled={!canSubmit} className="w-full h-10">
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

export default LoginForm;
