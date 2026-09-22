import { Outlet } from "react-router-dom";
import { MarketingNavbar } from "@/shared/ui/components/MarketingNavbar";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNavbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Outlet />
      </main>
    </div>
  );
}

export default PublicLayout;
