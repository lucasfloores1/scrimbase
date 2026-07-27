import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "Ocurrió un error",
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
        <Button
          variant="outline"
          className="border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-900"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export default ErrorState;