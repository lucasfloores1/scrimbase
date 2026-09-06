import { useQuery } from "@tanstack/react-query";
import { teamsApi } from "@/shared/api/teams.api";
import type { TeamMemberListItem, TeamRole } from "@/shared/types/models";
import { PageHeader } from "@/shared/ui/PageHeader";
import { LoadingState } from "@/shared/ui/feedback/LoadingState";
import { ErrorState } from "@/shared/ui/feedback/ErrorState";
import { cn } from "@/lib/utils";

function roleLabel(role: TeamRole, isAdmin: boolean) {
  if (isAdmin) return "Admin";
  if (role === "MANAGER") return "Manager";
  if (role === "COACH") return "Coach";
  return "Player";
}

export function TeamPage() {
  const query = useQuery({
    queryKey: ["teamMembers"],
    queryFn: () => teamsApi.getTeamMembers(),
  });

  if (query.isLoading) {
    return <LoadingState title="Loading roster" />;
  }

  if (query.isError) {
    const msg = query.error instanceof Error ? query.error.message : "Unexpected error";
    return (
      <ErrorState
        title="Could not load roster"
        description={msg}
        actionLabel="Retry"
        onAction={() => query.refetch()}
      />
    );
  }

  const members = [...(query.data ?? [])].sort((a: TeamMemberListItem, b: TeamMemberListItem) => {
    if (a.isAdmin !== b.isAdmin) return a.isAdmin ? -1 : 1;
    if (a.role === "MANAGER" && b.role !== "MANAGER") return -1;
    if (b.role === "MANAGER" && a.role !== "MANAGER") return 1;
    return (a.user?.username ?? "").localeCompare(b.user?.username ?? "");
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Roster"
        title="Team"
        description={`${members.length} members in your workspace.`}
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              <th className="px-4 py-3 font-medium">Player</th>
              <th className="px-4 py-3 font-medium">Riot ID</th>
              <th className="px-4 py-3 font-medium">Alt</th>
              <th className="px-4 py-3 font-medium">Role</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-border/70 last:border-0">
                <td className="px-4 py-3.5 font-medium whitespace-nowrap">
                  {m.user?.username ?? "—"}
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap text-muted-foreground">
                  {m.user?.riotId ?? "—"}
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap text-muted-foreground">
                  {m.user?.altAccountId ?? "—"}
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={cn(
                      "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
                      m.isAdmin
                        ? "border-ink/15 bg-ink text-signal"
                        : "border-border bg-muted text-muted-foreground",
                    )}
                  >
                    {roleLabel(m.role, m.isAdmin)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TeamPage;
