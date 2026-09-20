import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { PublicLayout } from "@/app/layouts/PublicLayout";
import { AuthLayout } from "@/app/layouts/AuthLayout";
import { AppLayout } from "@/app/layouts/AppLayout";
import { RequireAuth } from "@/app/router/guards/RequireAuth";
import { RequireTeam } from "@/app/router/guards/RequireTeam";
import { LoadingState } from "@/shared/ui/feedback/LoadingState";
import { SplashScreen } from "@/shared/ui/feedback/SplashScreen";

// Cada pantalla se descarga cuando se visita por primera vez: el bundle inicial queda chico.
const LandingPage = lazy(() => import("@/features/marketing/pages/LandingPage"));
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/features/auth/pages/RegisterPage"));
const OnboardingPage = lazy(() => import("@/features/onboarding/pages/OnboardingPage"));
const DashboardPage = lazy(() => import("@/features/team/pages/DashboardPage"));
const TeamPage = lazy(() => import("@/features/team/pages/TeamPage"));
const PlayerStatsPage = lazy(() => import("@/features/team/pages/PlayerStatsPage"));
const SettingsPage = lazy(() => import("@/features/team/pages/SettingsPage"));
const ScrimsListPage = lazy(() => import("@/features/scrims/pages/ScrimsListPage"));
const ScrimCreatePage = lazy(() => import("@/features/scrims/pages/ScrimCreatePage"));
const ScrimDetailPage = lazy(() => import("@/features/scrims/pages/ScrimDetailPage"));
const StratsListPage = lazy(() => import("@/features/strats/pages/StratsListPage"));
const StratCreatePage = lazy(() => import("@/features/strats/pages/StratCreatePage"));
const StratDetailPage = lazy(() => import("@/features/strats/pages/StratDetailPage"));
const NotFoundPage = lazy(() => import("@/shared/ui/feedback/NotFoundPage"));

const page = (node: ReactNode) => <Suspense fallback={<LoadingState variant="page" rows={4} />}>{node}</Suspense>;
const screen = (node: ReactNode) => <Suspense fallback={<SplashScreen />}>{node}</Suspense>;

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [{ path: "/", element: screen(<LandingPage />) }],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: screen(<LoginPage />) },
      { path: "/register", element: screen(<RegisterPage />) },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      { path: "/onboarding", element: screen(<OnboardingPage />) },
      {
        element: <RequireTeam />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: "/app", element: page(<DashboardPage />) },
              { path: "/app/scrims", element: page(<ScrimsListPage />) },
              { path: "/app/scrims/new", element: page(<ScrimCreatePage />) },
              { path: "/app/scrims/:scrimId", element: page(<ScrimDetailPage />) },
              { path: "/app/strats", element: page(<StratsListPage />) },
              { path: "/app/strats/new", element: page(<StratCreatePage />) },
              { path: "/app/strats/:stratId", element: page(<StratDetailPage />) },
              { path: "/app/team", element: page(<TeamPage />) },
              { path: "/app/team/:userId", element: page(<PlayerStatsPage />) },
              { path: "/app/settings", element: page(<SettingsPage />) },
              { path: "/app/*", element: <Navigate to="/app" replace /> },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: screen(<NotFoundPage />) },
]);
