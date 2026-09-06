import { Link, Outlet, useLocation } from "react-router-dom";

export function AuthLayout() {
  const location = useLocation();
  const isLogin = location.pathname.includes("login");

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between bg-ink text-white p-10 overflow-hidden">
        <div className="scrim-grid absolute inset-0 opacity-40" />
        <Link to="/" className="relative font-display text-sm font-semibold tracking-tight">
          Scrimbase
        </Link>
        <div className="relative space-y-4 max-w-md animate-rise">
          <p className="font-display text-4xl font-semibold tracking-tight text-balance leading-[1.1]">
            Log scrims.
            <br />
            Find the pattern.
          </p>
          <p className="text-sm text-white/55 leading-relaxed">
            Built for competitive Valorant teams that treat practice like product.
          </p>
        </div>
        <p className="relative text-xs text-white/35">Team workspace · AI scoreboard capture</p>
      </div>

      <div className="flex flex-col bg-background">
        <div className="flex items-center justify-between px-6 py-5 lg:justify-end">
          <Link to="/" className="font-display text-sm font-semibold lg:hidden">
            Scrimbase
          </Link>
          <p className="text-sm text-muted-foreground">
            {isLogin ? (
              <>
                New here?{" "}
                <Link to="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
                  Create account
                </Link>
              </>
            ) : (
              <>
                Have an account?{" "}
                <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
                  Log in
                </Link>
              </>
            )}
          </p>
        </div>

        <main className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="w-full max-w-sm animate-rise">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AuthLayout;
