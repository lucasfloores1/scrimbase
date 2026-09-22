import { useQuery } from "@tanstack/react-query";

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
      className: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    };
  }

  if (role === "MANAGER") {
    return {
      text: "Manager",
      className: "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400",
    };
  }

  if (role === "COACH") {
    return {
      text: "Coach",
      className: "bg-brand/10 text-brand border-brand/30",
    };
  }

  return {
    text: "Player",
    className: "bg-muted text-muted-foreground border-border",
  };
}

export function TeamPage() {

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
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">
          Team
        </h1>

        <p className="text-sm text-muted-foreground">
          Miembros de tu equipo y sus roles.
        </p>
      </header>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-foreground">
            Roster
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Username
                  </th>

                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Riot ID
                  </th>

                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Alt Account
                  </th>

                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Role
                  </th>
                </tr>
              </thead>

              <tbody>
                {members.map((m) => {
                  const role = roleStyle(m.role, m.isAdmin);

                  return (
                    <tr key={m.id} className="border-b border-border">
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">
                        {m.user?.username}
                      </td>

                      <td className="px-4 py-3 text-foreground whitespace-nowrap">
                        {m.user?.riotId}
                      </td>

                      <td className="px-4 py-3 text-foreground whitespace-nowrap">
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