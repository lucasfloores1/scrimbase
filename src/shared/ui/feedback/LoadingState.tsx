import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Props = {
  /** Cantidad de filas fantasma a mostrar. */
  rows?: number;
  /** "table" dibuja filas anchas; "cards" dibuja bloques; "page" un header + tabla. */
  variant?: "table" | "cards" | "page";
  className?: string;
};

export function LoadingState({ rows = 5, variant = "table", className }: Props) {
  if (variant === "cards") {
    return (
      <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)} aria-busy="true">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  }

  if (variant === "page") {
    return (
      <div className={cn("space-y-6", className)} aria-busy="true">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <LoadingState rows={rows} />
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)} aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-11 w-full" style={{ opacity: 1 - i * 0.12 }} />
      ))}
    </div>
  );
}

export default LoadingState;
