import { createBrowserRouter } from "react-router-dom";
import { PublicLayout } from "@/app/layouts/PublicLayout";
import { AuthLayout } from "@/app/layouts/AuthLayout";
import { AppLayout } from "@/app/layouts/AppLayout";
import { RequireAuth } from "@/app/router/guards/RequireAuth";
import { RequireTeam } from "@/app/router/guards/RequireTeam";

import { ScrimsPage } from "@/features/scrims/pages/ScrimsPage";
import { StratsPage } from "@/features/strats/pages/StratsPage";
import { TeamPage } from "@/features/team/pages/TeamPage";
import { SettingsPage } from "@/features/team/pages/SettingsPage";
import { LandingPage } from "@/features/marketing/pages/LandingPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { OnboardingPage } from "@/features/onboarding/pages/OnboardingPage";
import { DashboardPage } from "@/features/team/pages/DashboardPage";

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [{ path: "/", element: <LandingPage /> }],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      { path: "/onboarding", element: <OnboardingPage /> },

      {
        element: <RequireTeam />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: "/app", element: <DashboardPage /> },
              { path: "/app/scrims", element: <ScrimsPage /> },
              { path: "/app/strats", element: <StratsPage /> },
              { path: "/app/team", element: <TeamPage /> },
              { path: "/app/settings", element: <SettingsPage /> },
            ],
          },
        ],
      },
    ],
  },
]);