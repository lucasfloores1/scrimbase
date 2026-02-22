import { Outlet } from "react-router-dom";
import { MarketingNavbar } from "@/shared/ui/components/MarketingNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <MarketingNavbar />
      <main className="mx-auto flex min-h-[calc(100vh-56px)] max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Card className="border-slate-800 bg-slate-900/40">
            <CardHeader>
              <CardTitle>Welcome</CardTitle>
            </CardHeader>
            <CardContent>
              <Outlet />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;