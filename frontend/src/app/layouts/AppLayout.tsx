import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AppSidebar } from "@/app/layouts/components/AppSidebar";
import { AppTopbar } from "@/app/layouts/components/AppTopbar";

export function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AppTopbar onOpenMobileNav={() => setMobileNavOpen(true)} />

      {/* Mobile drawer */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="p-0 bg-slate-900 border-slate-800">
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
          <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}


export default AppLayout;