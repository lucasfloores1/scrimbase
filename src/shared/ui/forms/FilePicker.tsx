import { useId, useRef, useState } from "react";
import { ImageUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  file: File | null;
  onChange: (file: File | null) => void;
  previewUrl?: string | null;
  accept?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
};

/** Zona de arrastre + click con vista previa integrada. */
export function FilePicker({
  file,
  onChange,
  previewUrl,
  accept = "image/png,image/jpeg,image/webp",
  hint = "PNG, JPG o WebP",
  disabled,
  className,
}: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function pick(list: FileList | null) {
    const next = list?.[0] ?? null;
    if (next && !next.type.startsWith("image/")) return;
    onChange(next);
  }

  if (file && previewUrl) {
    return (
      <div className={cn("relative overflow-hidden rounded-lg ring-1 ring-foreground/10", className)}>
        <img src={previewUrl} alt={file.name} className="block max-h-[420px] w-full object-contain bg-black/40" />
        <div className="flex items-center justify-between gap-3 border-t bg-card px-3 py-2 text-xs">
          <span className="truncate text-muted-foreground">
            {file.name} · {(file.size / 1024).toFixed(0)} KB
          </span>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            disabled={disabled}
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
          >
            <X data-icon="inline-start" />
            Quitar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <label
      htmlFor={id}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!disabled) pick(e.dataTransfer.files);
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-10 text-center transition-colors",
        "hover:border-primary/40 hover:bg-primary/5 focus-within:ring-3 focus-within:ring-ring/50",
        dragging && "border-primary bg-primary/10",
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      <ImageUp className="size-7 text-muted-foreground" />
      <span className="text-sm font-medium">Arrastrá una captura o hacé click para elegirla</span>
      <span className="text-xs text-muted-foreground">{hint}</span>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => pick(e.target.files)}
      />
    </label>
  );
}

export default FilePicker;
