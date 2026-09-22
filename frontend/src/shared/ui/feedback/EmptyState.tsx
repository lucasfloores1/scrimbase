import { useI18n } from "@/app/providers/I18nProvider";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="space-y-1">
        <div className="text-sm font-medium text-foreground">{title ?? t("common.noData")}</div>
        {description ? <div className="text-sm text-muted-foreground">{description}</div> : null}
      </div>

      {actionLabel && onAction ? (
        <Button className="bg-brand text-brand-foreground hover:bg-brand-hover" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export default EmptyState;