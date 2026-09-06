import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AppSidebar } from "@/app/layouts/components/AppSidebar";
import { AppTopbar } from "@/app/layouts/components/AppTopbar";

export function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <div className="hidden md:flex md:w-56 md:shrink-0 md:border-r md:border-border md:bg-sidebar">
          <AppSidebar />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopbar onOpenMobileNav={() => setMobileNavOpen(true)} />

          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetContent side="left" className="w-56 p-0 border-r border-border">
              <AppSidebar onNavigate={() => setMobileNavOpen(false)} />
            </SheetContent>
          </Sheet>

          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
            <div className="mx-auto w-full max-w-5xl animate-rise">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
