import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import { useI18n } from "@/app/providers/I18nProvider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function ScrimsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();

  const isList = location.pathname === "/app/scrims";

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">
            {t("scrims.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("scrims.subtitle")}
          </p>
        </div>

        {isList ? (
          <Button
            className="bg-brand text-brand-foreground hover:bg-brand-hover"
            onClick={() => navigate("/app/scrims/new")}
          >
            <Plus className="mr-1 h-4 w-4" />
            {t("nav.uploadScrim")}
          </Button>
        ) : null}
      </header>

      <Separator />

      <Outlet />
    </div>
  );
}

export default ScrimsPage;