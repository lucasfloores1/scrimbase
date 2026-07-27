import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function ScrimsPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-100">
            Scrims
          </h1>
          <p className="text-sm text-slate-400">
            Registro y revisión de scrims del equipo.
          </p>
        </div>

        <Button
          className="bg-blue-600 text-white hover:bg-blue-500"
          onClick={() => navigate("/app/scrims/new")}
        >
          Subir scrim
        </Button>
      </header>

      <Separator className="bg-slate-800" />

      <Outlet />
    </div>
  );
}

export default ScrimsPage;