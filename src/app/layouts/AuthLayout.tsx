import { Link, Outlet } from "react-router-dom";
import { BrandLockup } from "@/shared/ui/brand/BrandMark";
import { GridPlane } from "@/shared/ui/three/GridPlane";

export function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-white/[0.07] bg-sidebar p-12 lg:flex">
        <GridPlane className="opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-sidebar via-sidebar/60 to-sidebar/20" aria-hidden="true" />

        <Link to="/" aria-label="Volver al inicio" className="relative">
          <BrandLockup />
        </Link>

        <div className="relative space-y-5">
          <p className="eyebrow">Análisis de scrims</p>
          <p className="max-w-sm text-4xl leading-[1.05] font-semibold tracking-tight">
            El historial de tu equipo,
            <span className="text-plasma block">mapa por mapa.</span>
          </p>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Subís la captura del scoreboard y Scrimbase la lee, la guarda y arma el rendimiento del roster.
          </p>
        </div>

        <p className="relative text-xs text-muted-foreground">© {new Date().getFullYear()} Scrimbase</p>
      </aside>

      <main className="flex flex-col px-6 py-8 sm:px-10">
        <Link to="/" className="lg:hidden" aria-label="Volver al inicio">
          <BrandLockup />
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;
