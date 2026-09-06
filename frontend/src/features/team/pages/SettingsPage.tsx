import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/app/providers/AuthProvider";
import { useTheme, type Theme } from "@/app/providers/ThemeProvider";
import { usersApi } from "@/shared/api/users.api";
import type { UpdateMeDto } from "@/shared/types/dto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/shared/ui/PageHeader";
import { LoadingState } from "@/shared/ui/feedback/LoadingState";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";

function isRiotIdLike(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  const parts = v.split("#");
  if (parts.length !== 2) return false;
  const [name, tag] = parts;
  return name.trim().length >= 3 && tag.trim().length >= 2;
}

export function SettingsPage() {
  const { user, isLoading, bootstrap, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [username, setUsername] = React.useState(user?.username ?? "");
  const [altAccountId, setAltAccountId] = React.useState(user?.altAccountId ?? "");
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
      setSuccess("Saved.");
      setClientError(null);
    },
  });

  if (isLoading) {
    return <LoadingState title="Loading settings" />;
  }

  if (!user) {
    return <PageHeader title="Settings" description="Sign in to manage your profile." />;
  }

  const isSaving = updateMeMutation.isPending;

  const themeOptions: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
  ];

  return (
    <div className="space-y-8 max-w-xl">
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Profile details used across roster matching."
      />

      <section className="rounded-2xl border border-border bg-surface p-5 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Appearance</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Switch between light and dark mode for the app.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {themeOptions.map((opt) => {
            const active = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                  active
                    ? "border-ink bg-ink text-signal"
                    : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <opt.icon className="h-4 w-4" strokeWidth={1.75} />
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Email</p>
          <p className="mt-1 text-sm font-medium">{user.email}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Riot ID</p>
          <p className="mt-1 text-sm font-medium">{user.riotId ?? "—"}</p>
        </div>
      </section>

      <form
        className="rounded-2xl border border-border bg-surface p-5 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSuccess(null);
          const next = username.trim();
          if (next.length < 3) {
            setClientError("Username must be at least 3 characters.");
            return;
          }
          updateMeMutation.mutate({ username: next });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-background"
          />
        </div>
        <Button type="submit" disabled={isSaving}>
          Save username
        </Button>
      </form>

      <form
        className="rounded-2xl border border-border bg-surface p-5 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSuccess(null);
          const value = altAccountId.trim();
          if (!value || !isRiotIdLike(value)) {
            setClientError("Use a valid Riot ID (name#TAG).");
            return;
          }
          updateMeMutation.mutate({ altAccountId: value });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="alt">Alt account</Label>
          <Input
            id="alt"
            value={altAccountId}
            onChange={(e) => setAltAccountId(e.target.value)}
            placeholder="alt#TAG"
            className="bg-background"
          />
          <p className="text-xs text-muted-foreground">
            Helps AI match you when you play on an alternate Riot ID.
          </p>
        </div>
        <Button type="submit" disabled={isSaving} variant="outline">
          Save alt account
        </Button>
      </form>

      {clientError ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {clientError}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-xl border border-border bg-accent px-3 py-2 text-sm text-accent-foreground">
          {success}
        </div>
      ) : null}

      <Button variant="ghost" className="text-muted-foreground" onClick={logout}>
        Log out
      </Button>
    </div>
  );
}

export default SettingsPage;
