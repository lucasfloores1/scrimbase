import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "Something went wrong",
  description,
  actionLabel,
  onAction,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-5">
      <div className="space-y-1">
        <div className="text-sm font-medium text-destructive">{title}</div>
        {description ? <div className="text-sm text-muted-foreground">{description}</div> : null}
      </div>
      {actionLabel && onAction ? (
        <Button variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export default ErrorState;
