import type { TeamRole } from "@/shared/types/models";
import { ROLE_LABELS } from "@/shared/constants/roles";
import { cn } from "@/lib/utils";

export function RoleBadge({ role, isAdmin }: { role: TeamRole; isAdmin?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "inline-flex h-6 items-center rounded border px-2 text-xs",
          role === "COACH" && "border-chart-4/50 text-chart-4",
          role === "MANAGER" && "border-chart-5/50 text-chart-5",
          role === "PLAYER" && "border-border text-muted-foreground"
        )}
      >
        {ROLE_LABELS[role] ?? role}
      </span>
      {isAdmin ? (
        <span className="inline-flex h-6 items-center rounded border border-amber/40 bg-amber/10 px-2 text-xs text-amber">Admin</span>
      ) : null}
    </span>
  );
}

export default RoleBadge;
