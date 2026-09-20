import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { SplashScreen } from "@/shared/ui/feedback/SplashScreen";

export function RequireTeam() {
  const { isLoading, isAuthed, hasTeam } = useAuth();

  if (isLoading) return <SplashScreen />;
  if (!isAuthed) return <Navigate to="/login" replace />;
  if (!hasTeam) return <Navigate to="/onboarding" replace />;

  return <Outlet />;
}
