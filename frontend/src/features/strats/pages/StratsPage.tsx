import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function StratsPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-100">
            Strats
          </h1>
          <p className="text-sm text-slate-400">
            Registro y revisión de strats del equipo.
          </p>
        </div>

        <Button
          className="bg-blue-600 text-white hover:bg-blue-500"
          onClick={() => navigate("/app/strats/new")}
        >
          Subir strat
        </Button>
      </header>

      <Separator className="bg-slate-800" />

      <Outlet />
    </div>
  );
}

export default StratsPage;