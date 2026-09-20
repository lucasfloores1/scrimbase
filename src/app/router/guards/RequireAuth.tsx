import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { SplashScreen } from "@/shared/ui/feedback/SplashScreen";

export function RequireAuth() {
  const { isLoading, isAuthed } = useAuth();
  const location = useLocation();

  if (isLoading) return <SplashScreen />;
  if (!isAuthed) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return <Outlet />;
}
