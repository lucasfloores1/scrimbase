import { ValorantAgent, VALORANT_AGENT_VALUES } from "../enums/valorant-agent.enum";

const ALIASES: Record<string, ValorantAgent> = {
  kayo: ValorantAgent.KAYO,
  "kay/o": ValorantAgent.KAYO,
  "kay-o": ValorantAgent.KAYO,
  "kairo": ValorantAgent.KAYO,
  killjoy: ValorantAgent.KILLJOY,
  "kill joy": ValorantAgent.KILLJOY,
  kj: ValorantAgent.KILLJOY,
};

/**
 * Maps messy OCR / LLM agent strings onto ValorantAgent.
 * Unknown or empty → UNKNOWN (never invent an agent).
 */
export function canonicalizeAgentName(raw: string): ValorantAgent {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return ValorantAgent.UNKNOWN;

  const lower = trimmed.toLowerCase();
  if (lower === "unknown") return ValorantAgent.UNKNOWN;

  const alias = ALIASES[lower];
  if (alias) return alias;

  const exact = VALORANT_AGENT_VALUES.find((a) => a.toLowerCase() === lower);
  if (exact) return exact;

  return ValorantAgent.UNKNOWN;
}
