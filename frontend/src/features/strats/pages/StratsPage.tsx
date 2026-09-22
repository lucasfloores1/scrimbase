import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function StratsPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">
            Strats
          </h1>
          <p className="text-sm text-muted-foreground">
            Registro y revisión de strats del equipo.
          </p>
        </div>

        <Button
          className="bg-brand text-brand-foreground hover:bg-brand-hover"
          onClick={() => navigate("/app/strats/new")}
        >
          Subir strat
        </Button>
      </header>

      <Separator />

      <Outlet />
    </div>
  );
}

export default StratsPage;