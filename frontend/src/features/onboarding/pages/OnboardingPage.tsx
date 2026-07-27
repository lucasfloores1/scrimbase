import CreateTeamCard from "../components/CreateTeamCard";
import JoinTeamCard from "../components/JoinTeamCard";

export function OnboardingPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex pt-10 justify-center px-6">

      <div className="w-full max-w-5xl">

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">
            Bienvenido 👋
          </h1>

          <p className="text-slate-400 mt-2">
            Unete a un equipo o crea uno nuevo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <JoinTeamCard />

          <CreateTeamCard />

        </div>

      </div>

    </div>
    );
}

export default OnboardingPage;