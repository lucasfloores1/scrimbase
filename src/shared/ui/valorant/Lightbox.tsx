import { useEffect, useState, type ReactNode } from "react";
import { X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Visor de captura. Se abre sobre la misma página (nunca en otra pestaña):
 * click para ampliar, Escape o click fuera para cerrar.
 */
export function Lightbox({
  src,
  alt,
  className,
  children,
}: {
  src: string;
  alt: string;
  className?: string;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ampliar la captura"
        className={cn(
          "group relative block w-full cursor-zoom-in overflow-hidden border border-border/70 bg-black/40 outline-none focus-visible:ring-3 focus-visible:ring-ring/60",
          className
        )}
      >
        {children ?? <img src={src} alt={alt} className="block w-full" loading="lazy" decoding="async" />}
        <span className="pointer-events-none absolute right-2 bottom-2 flex items-center gap-1.5 bg-background/85 px-2 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <ZoomIn className="size-3.5" />
          Ampliar
        </span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setOpen(false)}
          className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-background/92 p-4 duration-150 md:p-10"
        >
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 flex size-10 items-center justify-center border border-border bg-surface text-foreground hover:bg-accent"
          >
            <X className="size-5" />
          </button>
          <img
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full cursor-zoom-out object-contain"
          />
        </div>
      ) : null}
    </>
  );
}

export default Lightbox;
