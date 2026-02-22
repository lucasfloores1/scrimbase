import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { env } from "@/shared/config/env";

export function MarketingNavbar() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="font-semibold tracking-tight text-slate-100">
          Scrimbase
        </Link>

        <div className="flex items-center gap-2">
          {env.DEV_BYPASS_AUTH && (
            <Button asChild variant="outline" className="border-slate-800 bg-slate-950">
              <Link to="/app">Enter demo</Link>
            </Button>
          )}

          <Button asChild variant="ghost" className="text-slate-200 hover:bg-slate-900">
            <Link to="/login">Login</Link>
          </Button>

          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link to="/register">Register</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}