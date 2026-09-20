import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, CircleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Toast = { id: number; kind: "success" | "error"; message: string };
import { ToastContext, type ToastApi } from "./context";

/** Notificaciones breves tras una acción (guardar, borrar, cambiar rol). Sin dependencias. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);

  const push = useCallback((kind: Toast["kind"], message: string) => {
    const id = ++seq.current;
    setToasts((t) => [...t, { id, kind, message }].slice(-3));
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const api = useMemo<ToastApi>(() => ({ success: (m) => push("success", m), error: (m) => push("error", m) }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:px-6"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-center gap-2 rounded-lg border bg-popover px-3 py-2.5 text-sm shadow-lg shadow-black/40",
              "animate-in fade-in slide-in-from-bottom-2 duration-200",
              t.kind === "success" ? "border-win/30" : "border-destructive/30"
            )}
          >
            {t.kind === "success" ? (
              <CheckCircle2 className="size-4 shrink-0 text-win" />
            ) : (
              <CircleAlert className="size-4 shrink-0 text-destructive" />
            )}
            <span className="flex-1">{t.message}</span>
            <button
              type="button"
              aria-label="Cerrar"
              className="rounded p-0.5 text-muted-foreground hover:text-foreground"
              onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))}
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

