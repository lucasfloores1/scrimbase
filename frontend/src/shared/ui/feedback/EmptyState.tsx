import { Button } from "@/components/ui/button";

export function EmptyState({
  title = "Nothing here yet",
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
    <div className="space-y-4 rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-10 text-center">
      <div className="space-y-1.5">
        <div className="font-display text-base font-semibold tracking-tight">{title}</div>
        {description ? <div className="text-sm text-muted-foreground text-pretty mx-auto max-w-sm">{description}</div> : null}
      </div>
      {actionLabel && onAction ? <Button onClick={onAction}>{actionLabel}</Button> : null}
    </div>
  );
}

export default EmptyState;
