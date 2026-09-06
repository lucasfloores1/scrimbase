import CreateTeamCard from "../components/CreateTeamCard";
import JoinTeamCard from "../components/JoinTeamCard";
import { Link } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";

export function OnboardingPage() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-10 md:px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="font-display text-sm font-semibold tracking-tight">
            Scrimbase
          </Link>
          <button
            type="button"
            onClick={logout}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Log out
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-center py-12">
          <div className="mb-10 max-w-lg space-y-2 animate-rise">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Onboarding
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-balance">
              One more step
            </h1>
            <p className="text-sm text-muted-foreground text-pretty">
              Join your roster with an invite code, or create a new team workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 animate-rise-delay">
            <JoinTeamCard />
            <CreateTeamCard />
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingPage;
