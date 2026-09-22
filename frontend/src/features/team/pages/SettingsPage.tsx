import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { Monitor, Moon, Sun } from "lucide-react";

import { useAuth } from "@/app/providers/AuthProvider";
import { useI18n } from "@/app/providers/I18nProvider";
import { useTheme, type Theme } from "@/app/providers/ThemeProvider";
import { usersApi } from "@/shared/api/users.api";
import { LANGUAGES, LANGUAGE_LABELS, type TranslationKey } from "@/shared/i18n/locales";
import type { UpdateMeDto } from "@/shared/types/dto";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { LoadingState } from "@/shared/ui/feedback/LoadingState";

const THEME_OPTIONS: Array<{ value: Theme; labelKey: TranslationKey; icon: typeof Sun }> = [
  { value: "light", labelKey: "theme.light", icon: Sun },
  { value: "dark", labelKey: "theme.dark", icon: Moon },
  { value: "system", labelKey: "theme.system", icon: Monitor },
];

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
  const { t, language, setLanguage } = useI18n();
  const { theme, setTheme } = useTheme();

  const [username, setUsername] = React.useState<string>(user?.username ?? "");
  const [altAccountId, setAltAccountId] = React.useState<string>(user?.altAccountId ?? "");

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
      setSuccess(t("settings.saved"));
      setClientError(null);
    },
  });

  function errorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    return t("common.error");
  }

  if (isLoading) {
    return <LoadingState title={t("common.loading")} />;
  }

  if (!user) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-foreground">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("settings.needLogin")}</p>
      </div>
    );
  }

  const isSaving = updateMeMutation.isPending;

  function submitAlt(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(null);

    const value = altAccountId.trim();
    if (!value) {
      setClientError(t("settings.riotIdRequired"));
      return;
    }
    if (!isRiotIdLike(value)) {
      setClientError(t("settings.riotIdInvalid"));
      return;
    }

    updateMeMutation.mutate({ altAccountId: value });
  }

  function submitProfile(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(null);

    const next = username.trim();
    if (next.length < 3) {
      setClientError(t("settings.usernameTooShort"));
      return;
    }

    updateMeMutation.mutate({ username: next });
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
          {t("settings.title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
      </header>

      <Separator />

      {clientError || updateMeMutation.isError ? (
        <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          {clientError ?? errorMessage(updateMeMutation.error)}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success">
          {success}
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("settings.appearance")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>{t("theme.label")}</Label>
              <div className="flex flex-wrap gap-2">
                {THEME_OPTIONS.map(({ value, labelKey, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTheme(value)}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
                      theme === value
                        ? "border-brand bg-brand/10 text-foreground"
                        : "border-border text-muted-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {t(labelKey)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("language.label")}</Label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLanguage(code)}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm transition-colors",
                      language === code
                        ? "border-brand bg-brand/10 text-foreground"
                        : "border-border text-muted-foreground hover:bg-accent"
                    )}
                  >
                    {LANGUAGE_LABELS[code]}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{t("settings.appearanceHint")}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("settings.account")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label>{t("settings.email")}</Label>
                <Input value={user.email} disabled className="disabled:opacity-70" />
              </div>

              <div className="space-y-1">
                <Label>{t("settings.riotId")}</Label>
                <Input
                  value={user.riotId || t("common.notConfigured")}
                  disabled
                  className="disabled:opacity-70"
                />
              </div>
            </div>

            <form onSubmit={submitProfile} className="space-y-3">
              <div className="space-y-1">
                <Label>{t("settings.username")}</Label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} />
                <p className="text-xs text-muted-foreground">{t("settings.usernameHint")}</p>
              </div>

              <div className="flex items-center justify-end">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-brand text-brand-foreground hover:bg-brand-hover"
                >
                  {t("settings.saveProfile")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("settings.altAccount")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>{t("settings.altAccountLabel")}</Label>
              <Input
                value={altAccountId}
                onChange={(e) => setAltAccountId(e.target.value)}
                placeholder="altPlayer#EUW"
              />
              <p className="text-xs text-muted-foreground">{t("settings.altAccountHint")}</p>
            </div>

            <form onSubmit={submitAlt} className="flex items-center justify-end">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-brand text-brand-foreground hover:bg-brand-hover"
              >
                {t("settings.saveAlt")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("settings.session")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm text-foreground">{t("nav.logout")}</div>
              <div className="text-xs text-muted-foreground">{t("settings.logoutDesc")}</div>
            </div>
            <Button variant="outline" onClick={logout}>
              {t("nav.logout")}
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default SettingsPage;
