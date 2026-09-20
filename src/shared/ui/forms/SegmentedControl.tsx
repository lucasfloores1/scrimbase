import { cn } from "@/lib/utils";

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: readonly Option<T>[];
  className?: string;
  "aria-label"?: string;
};

/** Selector de pocas opciones excluyentes (tipo de partida, lado). */
export function SegmentedControl<T extends string>({ value, onChange, options, className, ...rest }: Props<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={rest["aria-label"]}
      className={cn("inline-flex w-full rounded-md border border-white/[0.05] bg-surface-2 p-1", className)}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "flex-1 rounded-[calc(var(--radius)-2px)] px-3 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              active ? "bg-surface-3 text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
