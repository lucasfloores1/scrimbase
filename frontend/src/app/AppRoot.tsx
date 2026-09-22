import { RouterProvider } from "react-router-dom";
import { QueryProvider } from "@/app/providers/QueryProvider";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { I18nProvider } from "@/app/providers/I18nProvider";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { LanguageGate } from "@/shared/ui/components/LanguageGate";
import { router } from "@/app/router";

export function AppRoot() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <QueryProvider>
          <AuthProvider>
            <LanguageGate />
            <RouterProvider router={router} />
          </AuthProvider>
        </QueryProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
