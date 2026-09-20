import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export function ErrorState({
  title = "No se pudo cargar",
  description,
  actionLabel,
  onAction,
  className,
}: Props) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4",
        className
      )}
    >
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-semibold">{title}</p>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        {actionLabel && onAction ? (
          <Button size="sm" variant="outline" className="mt-2" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export default ErrorState;
