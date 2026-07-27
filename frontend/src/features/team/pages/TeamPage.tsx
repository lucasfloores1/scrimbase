import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { teamsApi } from "@/shared/api/teams.api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { LoadingState } from "@/shared/ui/feedback/LoadingState";
import { ErrorState } from "@/shared/ui/feedback/ErrorState";

function roleStyle(role: string, isAdmin: boolean) {
  if (isAdmin) {
    return {
      text: "Admin",
      className: "bg-yellow-600/15 text-yellow-200 border-yellow-600/30",
    };
  }

  if (role === "MANAGER") {
    return {
      text: "Manager",
      className: "bg-purple-600/15 text-purple-200 border-purple-600/30",
    };
  }

  if (role === "COACH") {
    return {
      text: "Coach",
      className: "bg-blue-600/15 text-blue-200 border-blue-600/30",
    };
  }

  return {
    text: "Player",
    className: "bg-slate-600/15 text-slate-200 border-slate-600/30",
  };
}

export function TeamPage() {
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: ["teamMembers"],
    queryFn: () => teamsApi.getTeamMembers(),
  });

  if (query.isLoading) {
    return <LoadingState title="Cargando equipo" />;
  }

  if (query.isError) {
    const msg = query.error instanceof Error ? query.error.message : "Error inesperado";

    return (
      <ErrorState
        title="No se pudo cargar el equipo"
        description={msg}
        actionLabel="Reintentar"
        onAction={() => query.refetch()}
      />
    );
  }

  const members = [...(query.data ?? [])].sort((a: any, b: any) => {
    if (a.isAdmin) return -1;
    if (b.isAdmin) return 1;

    if (a.role === "MANAGER") return -1;
    if (b.role === "MANAGER") return 1;

    return 0;
  });

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-100">
          Team
        </h1>

        <p className="text-sm text-slate-400">
          Miembros de tu equipo y sus roles.
        </p>
      </header>

      <Separator className="bg-slate-800" />

      <Card className="border-slate-800 bg-slate-950/30">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-200">
            Roster
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-4 py-3 text-left font-medium text-slate-400">
                    Username
                  </th>

                  <th className="px-4 py-3 text-left font-medium text-slate-400">
                    Riot ID
                  </th>

                  <th className="px-4 py-3 text-left font-medium text-slate-400">
                    Alt Account
                  </th>

                  <th className="px-4 py-3 text-left font-medium text-slate-400">
                    Role
                  </th>
                </tr>
              </thead>

              <tbody>
                {members.map((m) => {
                  const role = roleStyle(m.role, m.isAdmin);

                  return (
                    <tr key={m.id} className="border-b border-slate-900">
                      <td className="px-4 py-3 text-slate-200 whitespace-nowrap">
                        {m.user?.username}
                      </td>

                      <td className="px-4 py-3 text-slate-200 whitespace-nowrap">
                        {m.user?.riotId}
                      </td>

                      <td className="px-4 py-3 text-slate-200 whitespace-nowrap">
                        {m.user?.altAccountId ?? "—"}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={role.className}
                        >
                          {role.text}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TeamPage;