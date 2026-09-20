import { agentRole } from "@/shared/constants/valorant";
import { cn } from "@/lib/utils";

const ROLE_TONE: Record<string, string> = {
  Duelista: "border-loss/50 text-loss",
  Iniciador: "border-chart-4/50 text-chart-4",
  Controlador: "border-chart-5/50 text-chart-5",
  Centinela: "border-win/50 text-win",
};

/** Agente con color según su rol; el color es la única señal extra, sin iconos remotos. */
export function AgentChip({ agent, className }: { agent: string; className?: string }) {
  const unknown = !agent || agent === "UNKNOWN";
  const role = agentRole(agent);
  return (
    <span
      title={role ? `${agent} · ${role}` : agent}
      className={cn(
        "inline-flex h-7 items-center rounded border px-2.5 text-sm whitespace-nowrap",
        unknown
          ? "border-dashed border-border text-muted-foreground italic"
          : (role && ROLE_TONE[role]) || "border-border text-foreground",
        className
      )}
    >
      {unknown ? "sin dato" : agent}
    </span>
  );
}

export function AgentComposition({ agents, className }: { agents: string[]; className?: string }) {
  if (!agents?.length) return <span className="text-sm text-muted-foreground">—</span>;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {agents.map((a, i) => (
        <AgentChip key={`${a}-${i}`} agent={a} />
      ))}
    </div>
  );
}

export default AgentChip;
