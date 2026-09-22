import { Languages } from "lucide-react";

import { useI18n } from "@/app/providers/I18nProvider";
import { Button } from "@/components/ui/button";
import { LANGUAGES, LANGUAGE_LABELS } from "@/shared/i18n/locales";

const GREETING: Record<string, string> = {
  es: "Elegí tu idioma",
  en: "Choose your language",
  pt: "Escolha seu idioma",
};

/** Se muestra una sola vez, antes de que el usuario haya elegido idioma. */
export function LanguageGate() {
  const { hasChosenLanguage, setLanguage } = useI18n();

  if (hasChosenLanguage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 p-4 backdrop-blur">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="flex items-center gap-2 text-brand">
          <Languages className="h-5 w-5" />
          <span className="text-sm font-semibold tracking-tight">Scrimbase</span>
        </div>

        <div className="mt-4 space-y-1">
          {LANGUAGES.map((code) => (
            <div key={`greet-${code}`} className="text-sm text-muted-foreground">
              {GREETING[code]}
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-2">
          {LANGUAGES.map((code) => (
            <Button
              key={code}
              variant="outline"
              className="justify-between"
              onClick={() => setLanguage(code)}
            >
              <span>{LANGUAGE_LABELS[code]}</span>
              <span className="text-xs font-semibold uppercase text-muted-foreground">{code}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LanguageGate;
