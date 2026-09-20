import { Link, Outlet } from "react-router-dom";
import { env } from "@/shared/config/env";
import { BrandLockup } from "@/shared/ui/brand/BrandMark";
import { Button } from "@/components/ui/button";

export function PublicLayout() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" aria-label="Scrimbase">
            <BrandLockup />
          </Link>
          <nav className="flex items-center gap-2">
            {env.DEV_BYPASS_AUTH ? (
              <Button asChild variant="outline" size="sm">
                <Link to="/app">Demo</Link>
              </Button>
            ) : null}
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Iniciar sesión</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/register">Crear cuenta</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-14 md:py-24">
        <Outlet />
      </main>
    </div>
  );
}

export default PublicLayout;
