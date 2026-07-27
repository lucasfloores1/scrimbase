import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";

export function RequireAuth() {
  const { isLoading, isAuthed } = useAuth();

  console.log("Require Auth status", "is Authed", isAuthed);

  if (isLoading) return null; // change for loading state
  if (!isAuthed) return <Navigate to="/login" replace />;

  return <Outlet />;
}