import { AGENTS_BY_ROLE } from "@/shared/constants/valorant";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/** Desplegable con los agentes de Valorant agrupados por rol. */
export function AgentSelect({
  value,
  onChange,
  id,
  ariaLabel,
  placeholder = "Elegir agente",
  className,
  disabled,
}: {
  value: string;
  onChange: (agent: string) => void;
  id?: string;
  ariaLabel?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  const known = value && value !== "UNKNOWN";
  return (
    <Select value={known ? value : undefined} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        id={id}
        aria-label={ariaLabel}
        className={cn("w-full", !known && "text-muted-foreground", className)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-80">
        {AGENTS_BY_ROLE.map(({ role, agents }) => (
          <SelectGroup key={role}>
            <SelectLabel>{role}</SelectLabel>
            {agents.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}

export default AgentSelect;
