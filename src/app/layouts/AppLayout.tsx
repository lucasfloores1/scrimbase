import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/app/layouts/components/AppSidebar";
import { AppTopbar } from "@/app/layouts/components/AppTopbar";
import { BottomNav } from "@/app/layouts/components/BottomNav";

export function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar />
        <main className="flex-1 px-4 pt-6 pb-24 md:px-10 md:pt-10 md:pb-12">
          <div className="mx-auto w-full max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

export default AppLayout;
