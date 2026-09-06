import { cn } from "@/lib/utils";
import { Expand, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  src: string | null;
  alt?: string;
  emptyLabel?: string;
  lightboxTitle?: string;
  className?: string;
  /** Max height of the inline preview */
  maxHeightClassName?: string;
};

export function ScreenshotPreview({
  src,
  alt = "Screenshot",
  emptyLabel = "No screenshot",
  lightboxTitle = "Screenshot",
  className,
  maxHeightClassName = "max-h-[min(52vh,480px)]",
}: Props) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-border bg-ink shadow-sm",
          className,
        )}
      >
        {src ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group relative block w-full cursor-zoom-in text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="View screenshot larger"
          >
            <img
              src={src}
              alt={alt}
              className={cn("block w-full object-contain bg-ink", maxHeightClassName)}
            />
            <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-black/55 px-2.5 py-1.5 text-xs font-medium text-white opacity-90 backdrop-blur-sm transition-opacity group-hover:opacity-100">
              <Expand className="h-3.5 w-3.5" strokeWidth={2} />
              Expand
            </span>
          </button>
        ) : (
          <div className="scrim-grid flex min-h-[220px] items-center justify-center px-8 sm:min-h-[280px]">
            <p className="max-w-xs text-center text-sm text-white/45">{emptyLabel}</p>
          </div>
        )}
      </div>

      {open && src
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
            >
              <button
                type="button"
                aria-label="Close preview"
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in-0 duration-150"
                onClick={() => setOpen(false)}
              />
              <div className="relative z-10 flex max-h-full w-full max-w-6xl flex-col gap-3 animate-in fade-in-0 zoom-in-95 duration-150">
                <div className="flex items-center justify-between gap-3 px-1">
                  <p id={titleId} className="text-sm font-medium text-white/80">
                    {lightboxTitle}
                  </p>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="overflow-auto rounded-xl border border-white/10 bg-black shadow-2xl">
                  <img
                    src={src}
                    alt={alt}
                    className="mx-auto block h-auto max-h-[min(88vh,900px)] w-auto max-w-full object-contain"
                  />
                </div>
                <p className="text-center text-xs text-white/50">
                  Click outside or press Esc to close
                </p>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
