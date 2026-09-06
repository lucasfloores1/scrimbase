import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { env } from "@/shared/config/env";

export function MarketingNavbar() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link
          to="/"
          className="font-display text-sm font-semibold tracking-tight text-white"
        >
          Scrimbase
        </Link>

        <div className="flex items-center gap-2">
          {env.DEV_BYPASS_AUTH ? (
            <Button asChild variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white">
              <Link to="/app">Demo</Link>
            </Button>
          ) : null}

          <Button asChild variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white">
            <Link to="/login">Log in</Link>
          </Button>

          <Button asChild className="bg-signal text-signal-foreground hover:bg-signal/90">
            <Link to="/register">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
