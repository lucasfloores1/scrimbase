import { Languages } from "lucide-react";

import { useI18n } from "@/app/providers/I18nProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LANGUAGES, LANGUAGE_LABELS } from "@/shared/i18n/locales";

export function LanguageSwitcher({ withLabel = false }: { withLabel?: boolean }) {
  const { language, setLanguage, t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {withLabel ? (
          <Button variant="outline" className="gap-2">
            <Languages className="h-4 w-4" />
            {LANGUAGE_LABELS[language]}
          </Button>
        ) : (
          <Button variant="ghost" size="icon" aria-label={t("language.label")}>
            <Languages className="h-4 w-4" />
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {LANGUAGES.map((code) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setLanguage(code)}
            className={language === code ? "bg-accent" : ""}
          >
            <span className="mr-2 text-xs font-semibold uppercase text-muted-foreground">{code}</span>
            {LANGUAGE_LABELS[code]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LanguageSwitcher;
