import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";
import { BrandLockup } from "@/shared/ui/brand/BrandMark";
import { Button } from "@/components/ui/button";
import CreateTeamCard from "../components/CreateTeamCard";
import JoinTeamCard from "../components/JoinTeamCard";

export function OnboardingPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <header className="flex h-14 items-center justify-between px-4 md:px-8">
        <BrandLockup />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            logout();
            navigate("/login", { replace: true });
          }}
        >
          <LogOut data-icon="inline-start" />
          Salir
        </Button>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 md:py-16">
        <div className="mb-10 space-y-2">
          <h1 className="text-3xl font-medium tracking-[0.04em] uppercase md:text-4xl">
            Hola{user?.username ? `, ${user.username}` : ""}.
          </h1>
          <p className="text-muted-foreground">Para empezar necesitás un equipo. Podés crear uno o entrar con un código.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <JoinTeamCard />
          <CreateTeamCard />
        </div>
      </main>
    </div>
  );
}

export default OnboardingPage;
