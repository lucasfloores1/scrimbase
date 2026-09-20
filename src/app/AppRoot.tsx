import { RouterProvider } from "react-router-dom";
import { QueryProvider } from "@/app/providers/QueryProvider";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { ToastProvider } from "@/shared/ui/toast/Toaster";
import { router } from "@/app/router";

export function AppRoot() {
  return (
    <QueryProvider>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
