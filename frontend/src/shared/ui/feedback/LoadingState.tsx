import { Loader2 } from "lucide-react";

export function LoadingState({
  title = "Loading",
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-5">
      <Loader2 className="mt-0.5 h-5 w-5 animate-spin text-muted-foreground" />
      <div className="space-y-1">
        <div className="text-sm font-medium">{title}</div>
        {description ? <div className="text-sm text-muted-foreground">{description}</div> : null}
      </div>
    </div>
  );
}

export default LoadingState;
