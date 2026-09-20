import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Tarjeta que se inclina siguiendo al puntero, con un reflejo que se mueve
 * con la misma normal. Transform puro: no re-renderiza React en cada frame.
 */
export function TiltCard({
  children,
  className,
  max = 7,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  /** Inclinación máxima en grados. */
  max?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLSpanElement>(null);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.transform = `rotateY(${(px - 0.5) * max * 2}deg) rotateX(${(0.5 - py) * max * 2}deg) translateZ(0)`;
    if (glareRef.current) {
      glareRef.current.style.background = `radial-gradient(400px circle at ${px * 100}% ${py * 100}%, oklch(1 0 0 / 0.1), transparent 45%)`;
    }
  }

  function reset() {
    const el = ref.current;
    if (el) el.style.transform = "";
    if (glareRef.current) glareRef.current.style.background = "transparent";
  }

  return (
    <div className="scene">
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={reset}
        className={cn("card-3d relative", className)}
      >
        {children}
        {glare ? (
          <span ref={glareRef} aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit]" />
        ) : null}
      </div>
    </div>
  );
}

export default TiltCard;
