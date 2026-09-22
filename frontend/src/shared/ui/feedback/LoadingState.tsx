import { Loader2 } from "lucide-react";

import { useI18n } from "@/app/providers/I18nProvider";

export function LoadingState({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) {
  const { t } = useI18n();

  return (
    <div className="flex items-start gap-3 rounded-lg border p-4">
      <Loader2 className="mt-0.5 h-5 w-5 animate-spin text-muted-foreground" />
      <div className="space-y-1">
        <div className="text-sm font-medium text-foreground">{title ?? t("common.loading")}</div>
        {description ? <div className="text-sm text-muted-foreground">{description}</div> : null}
      </div>
    </div>
  );
}

export default LoadingState;