import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { LANGUAGES, translations, type Language, type TranslationKey } from "@/shared/i18n/locales";

const STORAGE_KEY = "scrimbase.language";

const LOCALE_TAGS: Record<Language, string> = {
  es: "es-AR",
  en: "en-US",
  pt: "pt-BR",
};

type I18nState = {
  language: Language;
  localeTag: string;
  hasChosenLanguage: boolean;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  formatDate: (value?: string | Date | null, options?: Intl.DateTimeFormatOptions) => string;
};

const I18nContext = createContext<I18nState | null>(null);

function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && (LANGUAGES as readonly string[]).includes(value);
}

function detectLanguage(): Language {
  const browser = typeof navigator !== "undefined" ? navigator.language.slice(0, 2) : "es";
  return isLanguage(browser) ? browser : "es";
}

function readStored(): Language | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isLanguage(stored) ? stored : null;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const stored = readStored();

  const [language, setLanguageState] = useState<Language>(stored ?? detectLanguage());
  const [hasChosenLanguage, setHasChosenLanguage] = useState(stored !== null);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    setHasChosenLanguage(true);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      const template = translations[language][key] ?? translations.es[key] ?? key;
      if (!vars) return template;

      return Object.entries(vars).reduce(
        (acc, [name, value]) => acc.replaceAll(`{${name}}`, String(value)),
        template
      );
    },
    [language]
  );

  const formatDate = useCallback(
    (value?: string | Date | null, options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }) => {
      if (!value) return "—";
      const date = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(date.getTime())) return String(value);

      try {
        return new Intl.DateTimeFormat(LOCALE_TAGS[language], options).format(date);
      } catch {
        return date.toISOString();
      }
    },
    [language]
  );

  const value = useMemo<I18nState>(
    () => ({
      language,
      localeTag: LOCALE_TAGS[language],
      hasChosenLanguage,
      setLanguage,
      t,
      formatDate,
    }),
    [language, hasChosenLanguage, setLanguage, t, formatDate]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
