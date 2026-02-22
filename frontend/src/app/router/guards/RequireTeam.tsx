import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";

export function RequireTeam() {
  const { isLoading, isAuthed, hasTeam } = useAuth();

  if (isLoading) return null; // change for loading state
  if (!isAuthed) return <Navigate to="/login" replace />;
  if (!hasTeam) return <Navigate to="/onboarding" replace />;

  return <Outlet />;
}