/**
 * Valorant agents + UNKNOWN for OCR/AI when confidence is low.
 * Add new agents here when Riot ships them.
 */
export enum ValorantAgent {
  ASTRA = "Astra",
  BREACH = "Breach",
  BRIMSTONE = "Brimstone",
  CHAMBER = "Chamber",
  CLOVE = "Clove",
  CYPHER = "Cypher",
  DEADLOCK = "Deadlock",
  FADE = "Fade",
  GEKKO = "Gekko",
  HARBOR = "Harbor",
  ISO = "Iso",
  JETT = "Jett",
  KAYO = "KAY/O",
  KILLJOY = "Killjoy",
  MIKS = "Miks",
  NEON = "Neon",
  OMEN = "Omen",
  PHOENIX = "Phoenix",
  RAZE = "Raze",
  REYNA = "Reyna",
  SAGE = "Sage",
  SKYE = "Skye",
  SOVA = "Sova",
  TEJO = "Tejo",
  VETO = "Veto",
  VIPER = "Viper",
  VYSE = "Vyse",
  WAYLAY = "Waylay",
  YORU = "Yoru",
  /** Fallback when OCR/AI cannot identify the agent */
  UNKNOWN = "UNKNOWN",
}

export const VALORANT_AGENT_VALUES = Object.values(ValorantAgent);

/** Agents shown in UI pickers (excludes UNKNOWN). */
export const VALORANT_PLAYABLE_AGENTS = VALORANT_AGENT_VALUES.filter(
  (a) => a !== ValorantAgent.UNKNOWN,
);
