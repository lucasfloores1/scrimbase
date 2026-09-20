import { AlertTriangle, CheckCircle2, CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  kind: "error" | "success" | "warning";
  children: React.ReactNode;
  className?: string;
};

const styles = {
  error: "border-destructive/30 bg-destructive/10",
  success: "border-win/30 bg-win/10",
  warning: "border-chart-4/30 bg-chart-4/10",
};

/** Mensaje inline para formularios (error de API, validación, aviso, éxito). */
export function FormMessage({ kind, children, className }: Props) {
  const Icon = kind === "error" ? CircleAlert : kind === "success" ? CheckCircle2 : AlertTriangle;
  const iconColor = kind === "error" ? "text-destructive" : kind === "success" ? "text-win" : "text-chart-4";
  return (
    <div
      role={kind === "success" ? "status" : "alert"}
      className={cn("flex items-start gap-2 rounded-md border px-3 py-2 text-sm text-foreground", styles[kind], className)}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", iconColor)} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export default FormMessage;
