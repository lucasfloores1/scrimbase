import { Button } from "@/components/ui/button";

export function EmptyState({
  title = "No hay datos",
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
    <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-950/30 p-4">
      <div className="space-y-1">
        <div className="text-sm font-medium text-slate-200">{title}</div>
        {description ? <div className="text-sm text-slate-400">{description}</div> : null}
      </div>

      {actionLabel && onAction ? (
        <Button className="bg-blue-600 text-white hover:bg-blue-500" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export default EmptyState;