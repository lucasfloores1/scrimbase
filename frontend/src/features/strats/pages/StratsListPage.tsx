import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { stratsApi } from "@/shared/api/strats.api";
import type { StratDto } from "@/shared/types/dto";
import { LoadingState } from "@/shared/ui/feedback/LoadingState";
import { ErrorState } from "@/shared/ui/feedback/ErrorState";
import { EmptyState } from "@/shared/ui/feedback/EmptyState";

function formatDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function StratsListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const teamId = user?.teamMember?.teamId;

  const query = useQuery({
    queryKey: ["strats", teamId],
    queryFn: () => stratsApi.list(teamId!),
    enabled: Boolean(teamId),
  });

  if (!teamId) {
    return <EmptyState title="No team" description="Join a team to see strats." />;
  }

  if (query.isLoading) return <LoadingState title="Loading strats" />;
  if (query.isError) {
    return (
      <ErrorState
        title="Could not load strats"
        description={query.error instanceof Error ? query.error.message : "Error"}
        actionLabel="Retry"
        onAction={() => query.refetch()}
      />
    );
  }

  const strats = (query.data ?? []) as StratDto[];

  if (strats.length === 0) {
    return (
      <EmptyState
        title="No strats yet"
        description="Save a setup with a screenshot and notes."
        actionLabel="New strat"
        onAction={() => navigate("/app/strats/new")}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {strats.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => navigate(`/app/strats/${s.id}`)}
          className="rounded-2xl border border-border bg-surface p-5 text-left transition-colors hover:bg-muted/40"
        >
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {s.map}
            {s.side ? ` · ${s.side}` : ""}
          </p>
          <h3 className="mt-2 font-display text-lg font-semibold tracking-tight">{s.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {s.notes || "No notes"}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">{formatDate(s.createdAt)}</p>
        </button>
      ))}
    </div>
  );
}
