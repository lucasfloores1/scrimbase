import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Plus } from "lucide-react";

export function StratsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isIndex = location.pathname === "/app/strats" || location.pathname === "/app/strats/";

  return (
    <div className="space-y-8">
      {isIndex ? (
        <PageHeader
          eyebrow="Library"
          title="Strats"
          description="Setups and executes for your maps."
          actions={
            <Button className="gap-1.5" onClick={() => navigate("/app/strats/new")}>
              <Plus className="h-4 w-4" />
              New strat
            </Button>
          }
        />
      ) : null}
      <Outlet />
    </div>
  );
}

export default StratsPage;
