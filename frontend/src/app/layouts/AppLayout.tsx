import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AppSidebar } from "@/app/layouts/components/AppSidebar";
import { AppTopbar } from "@/app/layouts/components/AppTopbar";

export function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppTopbar onOpenMobileNav={() => setMobileNavOpen(true)} />

      {/* Mobile drawer */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-64 border-border bg-sidebar p-0">
          <AppSidebar />
        </SheetContent>
      </Sheet>

      <div className="mx-auto flex max-w-6xl">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6">
          <div className="rounded-lg border border-border bg-surface/40 p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}


export default AppLayout;