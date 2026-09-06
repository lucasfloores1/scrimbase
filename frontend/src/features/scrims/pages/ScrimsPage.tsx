import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Plus } from "lucide-react";

export function ScrimsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isIndex = location.pathname === "/app/scrims" || location.pathname === "/app/scrims/";

  return (
    <div className="space-y-8">
      {isIndex ? (
        <PageHeader
          eyebrow="Library"
          title="Scrims"
          description="Match history extracted from scoreboards."
          actions={
            <Button className="gap-1.5" onClick={() => navigate("/app/scrims/new")}>
              <Plus className="h-4 w-4" />
              Upload
            </Button>
          }
        />
      ) : null}
      <Outlet />
    </div>
  );
}

export default ScrimsPage;
