import { BrandMark } from "@/shared/ui/brand/BrandMark";

/** Pantalla completa mientras se resuelve la sesión. */
export function SplashScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center" aria-busy="true" aria-label="Cargando">
      <BrandMark className="size-8 animate-pulse text-primary" />
    </div>
  );
}

export default SplashScreen;
