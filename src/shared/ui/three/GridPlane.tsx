import { cn } from "@/lib/utils";

/**
 * Plano 3D en perspectiva: una malla que se aleja hacia el horizonte y avanza
 * en bucle. Son transformaciones CSS reales (perspective + rotateX), no una
 * imagen ni WebGL, así que pesa cero, se ve igual en cualquier GPU y respeta
 * prefers-reduced-motion. El brillo del horizonte es un degradado radial.
 */
export function GridPlane({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      {/* Resplandor sobre la línea del horizonte */}
      <div
        className="absolute inset-x-0 top-[52%] h-72"
        style={{
          background:
            "radial-gradient(55% 100% at 50% 100%, oklch(0.63 0.21 288 / 0.45), oklch(0.63 0.21 288 / 0) 72%)",
        }}
      />
      <div
        className="absolute inset-x-0 top-[56%] h-px"
        style={{ background: "linear-gradient(90deg, transparent, oklch(0.85 0.14 205 / 0.75), transparent)" }}
      />

      {/* Malla en perspectiva */}
      <div className="absolute inset-x-[-25%] top-[56%] h-[85%] [perspective:700px] [perspective-origin:50%_0%]">
        <div className="grid-plane size-full origin-top [transform:rotateX(68deg)]" />
      </div>

      {/* Difuminado de los bordes para fundir con la página */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, var(--background) 0%, oklch(0.145 0.012 265 / 0) 40%, oklch(0.145 0.012 265 / 0) 80%, var(--background) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, var(--background) 0%, oklch(0.145 0.012 265 / 0) 18%, oklch(0.145 0.012 265 / 0) 82%, var(--background) 100%)",
        }}
      />
    </div>
  );
}

export default GridPlane;
