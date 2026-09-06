import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/features/auth/hooks/useRegister";

function errorToMessage(err: unknown): string {
  if (!err) return "";
  if (err instanceof Error) return err.message;
  return "Could not create account.";
}

function looksLikeRiotId(value: string) {
  return (
    value.includes("#") &&
    value.split("#")[0].trim().length > 0 &&
    value.split("#")[1].trim().length > 0
  );
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
      <div className="space-y-1.5">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Create account</h1>
        <p className="text-sm text-muted-foreground">Set up your player profile to join a team.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-surface h-10"
          placeholder="you@team.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="bg-surface h-10"
          placeholder="Public name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="riotId">Riot ID</Label>
        <Input
          id="riotId"
          value={riotId}
          onChange={(e) => setRiotId(e.target.value)}
          className="bg-surface h-10"
          placeholder="Name#TAG"
        />
        <p className="text-xs text-muted-foreground">Required format: gameUsername#TAG</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-surface h-10"
          placeholder="At least 6 characters"
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {errorToMessage(error)}
        </div>
      ) : null}

      <Button type="submit" disabled={!canSubmit} className="w-full h-10">
        {isPending ? "Creating…" : "Create account"}
      </Button>
    </form>
  );
}

export default RegisterForm;
