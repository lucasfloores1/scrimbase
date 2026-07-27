import { Loader2 } from "lucide-react";

export function LoadingState({
  title = "Cargando",
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/30 p-4">
      <Loader2 className="mt-0.5 h-5 w-5 animate-spin text-slate-300" />
      <div className="space-y-1">
        <div className="text-sm font-medium text-slate-200">{title}</div>
        {description ? <div className="text-sm text-slate-400">{description}</div> : null}
      </div>
    </div>
  );
}

export default LoadingState;